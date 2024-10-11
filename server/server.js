import express from 'express'
import cors from 'cors'
import VectorIndex from './vector-index.js'

const app = express();
const PORT = 3001;

// Middleware to parse JSON bodies
app.use(express.json({ limit: '1gb' }));
app.use(cors());

let index = new VectorIndex({ id: 'index' })
index.init()
// Route to insert vectors
app.post('/insert', async (req, res) => {
    const items = req.body; // Get the JSON body

    await index.insertVector(items)
    res.status(200).json({ message: 'Vectors inserted successfully.' });
});

// Route to search
app.post('/search', async (req, res) => {
    const { vector } = req.body; // Get the JSON body

    const result = await index.search(vector)

    res.status(200).json({ result });
});

app.post('/get-existing', async (req, res) => {
    const items = req.body

    const tweetIdMap = await index.getTweetIdMap()
    let result = []
    for (let item of items) {
        const hasItem = (tweetIdMap[item] != undefined)
        result.push(hasItem)
    }

    res.status(200).json(result);
});

app.post('/delete-db', async (req, res) => {
    await index.vectorDBIndex.deleteIndex()
    index = new VectorIndex({ id: 'index' })
    await index.init()

    res.status(200).json({ message: 'Done' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});