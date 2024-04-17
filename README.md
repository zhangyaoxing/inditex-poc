# Inditex POC
## Test Dataset
- We are using the [CORD-19](https://www.kaggle.com/datasets/allen-institute-for-ai/CORD-19-research-challenge) (COVID-19 Open Research Dataset Challenge) dataset for testing.
- The data used in the POC is from the `./document_parses/pdf_json` folder.

Note this is a 20GB huge dataset. >100GB when unzipped. Make sure you have enough space to hold everything.

## Import Test Data
### Dependencies
```bash
sudo yum install -y jq cyrus-sasl cyrus-sasl-gssapi cyrus-sasl-plain
```

### Executables
The script uses `mongoimport` together with `jq` to import the json files. `mongoimport` is included in the [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools).

### Configuration
The following configuration should be replaced by yours:
- `uri='mongodb+srv://<user>:<pwd>@vectorsearchpoc.wy1z6.mongodb.net/'`: The target MongoDB URI.
- `db=covid`: Database name where you want to store the dataset.
- `coll=paper`: Collection name where you want to store the dataset.
- `json_source="<path_to_test_dataset>/document_parses/pdf_json/*.json"`: Where to find the json files.

### How to Import
```bash
./import.sh
```

### What's Imported
Each json file is a big one has a lot of data included. We don't need all of them. Only the following fields are imported for this testing:
- `paper_id`: `paper_id`
- `title`: `metadata.title`
- `text`: `body_text.text`
- `section`: `body_text.section`

Note the `body_text` is an array. We unwinded the array so that each text snippet is inserted as one document.  
This is an example of the final document structure:
```json
{
  "_id": {
    "$oid": "6619439e4728952eae60aeb8"
  },
  "paper_id": "0000028b5cc154f68b8a269f6578f21e31f62977",
  "title": "\"Multi-faceted\" COVID-19: Russian experience",
  "text": "According to current live statistics at the time of editing this letter, Russia has been the third country in the world to be affected by COVID-19 with both new cases and death rates rising. It remains in a position of advantage due to the later onset of the viral spread within the country since the worldwide disease outbreak.",
  "section": "Editor"
}
```

## Peroformance Test
### The Logic
- The application first load `numSamples` documents from the collection. The `embedding` in these documents will be used for later test.
- When a request arrives,
  - The application will randomly get 1 embedding from the previously loaded embeddings.
  - Use the embedding to do vector search.
  - The search result will return `limit` of `numCandidates`.
- The full document (without embedding because it's big and is usually useless to the client) will be returned to the client.

### Dependencies
- NodeJS v18.
- Source code in `/performance-test` folder.
- Packages and tools:
```bash
cd performance-test
npm install
npm install -g pm2
```

### Run
To start:
```bash
pm2 start bin/www -i max --watch
```
To review logs:
```bash
pm2 log www
```
To stop:
```bash
pm2 stop www
```
To remove
```bash
pm2 delete www
```

### Test
Apache ab is used for testing
```bash
yum install httpd
ab -n 100 -c 1 http://localhost/vector-search
```