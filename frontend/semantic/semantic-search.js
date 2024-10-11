import { getDB, initSchema, countRows, seedDb, search, batchInsert, checkRowsExistByContent } from "./db";
import OpenAI from 'openai'

export class SemanticSearch {
    constructor() {
        this.OPEN_API_KEY = ''
    }

    async initDB() {
        const db = await getDB()
        await initSchema(db);
        this.db = db

        const rows = await countRows(db, 'embeddings')
        console.log(`Found ${rows} rows`);
    }

    async clearDB() {
        // await this.db.exec('DROP TABLE IF EXISTS embeddings;');
        const dbResponse = await fetch('http://localhost:3001/delete-db', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        console.log(await dbResponse.json())
    }

    async getExistingTweets(tweets) {
        // const content = tweets.map(tweet => tweet.full_text)
        // const result = await checkRowsExistByContent(this.db, content)

        const tweets_ids = tweets.map(tweet => tweet.id)
        const response = await fetch('http://localhost:3001/get-existing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tweets_ids)
        })
        const result = await response.json()
        
        const existingTweets = new Set();
        for (let i = 0; i < tweets_ids.length; i++) {
            const id = tweets_ids[i]
            if (result[i]) {
                existingTweets.add(id)
            }
        }
        return existingTweets 
    }

    async embed(tweets) {
        const textArray = tweets.map(tweet => tweet.full_text)

        const api = new OpenAI({ apiKey: this.OPEN_API_KEY, dangerouslyAllowBrowser: true });
        const response = await api.embeddings.create({
            'model': 'text-embedding-ada-002',
            'input': textArray,
        });
        const embeddings = response.data.map(item => item.embedding)
        console.log("Got response from OpenAI")

        const data = []
        for (let i = 0; i < textArray.length; i++) {
            const tweet = tweets[i]
            data.push({ key: textArray[i], embedding: embeddings[i], tweet_id: tweet.id })
        }
        console.log("Inserting into DB")
        // await batchInsert(this.db, data)

        const dbResponse = await fetch('http://localhost:3001/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        console.log(await dbResponse.json())
    }

    async search(queryString) {
        const api = new OpenAI({ apiKey: this.OPEN_API_KEY, dangerouslyAllowBrowser: true });
        const response = await api.embeddings.create({
            'model': 'text-embedding-ada-002',
            'input': [queryString],
        });
        const embedding = response.data.map(item => item.embedding)[0]

        const dbResponse = await fetch('http://localhost:3001/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ vector: embedding })
        })
        const result = await dbResponse.json()
        return result

        // const result = await search(this.db, embedding);
        // return result
    }
}

async function init() {
    
    let count = await countRows(db, "embeddings");
    console.log(`Found ${count} rows`);
    console.log(db)
    
    
    
    window.worker = worker
    
    worker.addEventListener("message", function(e) {
        console.log(e)
    });
    
 
}

// this is for doing the embedding itself locally vs sending it to OpenAI
// const worker = new Worker("./semantic-search-worker.js", {
//     type: "module",
// });
// this.worker = worker
/*

const searchResults = await search(db.current, e.data.embedding);
console.log({ searchResults });

*/