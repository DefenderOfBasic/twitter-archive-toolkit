# 🛠️ Twitter Archive Toolkit

Swiss army knife for experiments with my twitter archive. 

Live demo:

- The basic viewer defaults to loading my twitter JSON
- You can replace it with your own JSON, either from the community-archive or locally
- To get yours from the community-archive, see the URL list in [data/bucket-urls.json](./data/bucket-urls.json) 
    - To do it locally:
        - run the script `./scripts/raw-archive-to-json.js`. Set the filepath to your twitter archive
        - this will combine all the relevant data from the ZIP file into one json
        - put that JSON into `frontend/public/local-archives/` (or just host it anywhere)
        - give the app that URL

## Semantic search

- Clone this repo, run `pnpm install`
- Run `pnpm dev` to launch frontend
- In a separate terminal, run `pnpm start-server`
- Open http://localhost:3000/semantic-search.html
- Enter your OpenAI API key on the page, then refresh

This will automatically fetch the tweets from the given archive, embed them using OpenAI's embedding model, store the vector results in a local JSON file using Vectra. Once it's done embedding, you can search your tweets semantically.

