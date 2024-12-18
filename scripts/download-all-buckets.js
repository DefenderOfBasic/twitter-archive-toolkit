// download.js
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';
import ProgressBar from 'progress';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function downloadArchives(inputFile) {
    // Create output directory if it doesn't exist
    const outputDir = join(__dirname, '../frontend/public/', 'archives');
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }

    // Read and parse input file
    const data = JSON.parse(await fs.readFile(inputFile, 'utf8'));
    const total = Object.keys(data).length;
    
    // Setup progress bar
    const bar = new ProgressBar('Downloading [:bar] :current/:total :percent :etas :username', {
        complete: '=',
        incomplete: ' ',
        width: 30,
        total
    });

    // Process each archive
    for (const [username, url] of Object.entries(data)) {
        const outputFile = join(outputDir, `${username}.json`);
        
        // Skip if file exists
        if (existsSync(outputFile)) {
            bar.tick({ username: `${username} (skipped - exists)` });
            continue;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            await fs.writeFile(outputFile, content);
            bar.tick({ username });
        } catch (error) {
            console.error(`\nError downloading ${username}: ${error.message}`);
            bar.tick({ username: `${username} (error)` });
        }
    }

    console.log('\nDownload complete!');
}

// Check if input file is provided
const inputFile = 'data/bucket-urls.json';
if (!inputFile) {
    console.error('Please provide an input file path');
    process.exit(1);
}

// Run the download
downloadArchives(inputFile).catch(console.error);