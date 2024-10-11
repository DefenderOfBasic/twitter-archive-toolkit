import { LocalIndex } from 'vectra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 // local usage:
 
 const embeddings = new Embeddings({ id: 'unique_id_for_local_db' })
 await embeddings.init()

 // insert text if it's not already in the DB
 embeddings.insertText(["one", "two", "banana"]))

 // find the closest items to the query string
 const items = await embeddings.search("search string") 
 */
export default class VectorIndex {
    constructor({ 
        id, 
        dataPath = path.join(__dirname, `.data/`)
    }) {
        this.id = id 
        console.log(path.join(dataPath, id))
        this.vectorDBIndex = new LocalIndex(path.join(dataPath, id));
    }

    async init() {
        const index = this.vectorDBIndex
        if (!await index.isIndexCreated()) {
            await index.createIndex();
        }
    }

    async insertVector(items) {
        const index = this.vectorDBIndex
        await index.beginUpdate();
        for (let item of items) {
            await index.insertItem({
                vector: item.embedding,
                metadata: { text: item.key, tweet_id: item.tweet_id }
            });
        }
        await index.endUpdate();
    }

    async search(searchVector, max = 100) {
        const index = this.vectorDBIndex
        const results = await index.queryItems(searchVector, max);
        return results
    }

    // Given text, find the item & its associated vector
    async findByText(text) {
        const index = this.vectorDBIndex
        return await index.listItemsByMetadata({ text: { $eq: text } })
    }
    // map of embedded text -> vector
    async getTextMap() {
        const allItems = await this.vectorDBIndex.listItems()
        const itemMap = {}
        for (let item of allItems) {
            const key = item.metadata.text
            itemMap[key] = item
        }

        return itemMap
    }

    async getTweetIdMap() {
        const allItems = await this.vectorDBIndex.listItems()
        const itemMap = {}
        for (let item of allItems) {
            itemMap[item.metadata.tweet_id] = item
        }

        return itemMap
    }
}