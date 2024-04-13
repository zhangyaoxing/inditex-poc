from sentence_transformers import SentenceTransformer
from pymongo.mongo_client import MongoClient
from pymongo import UpdateOne
import os

BATCH_SIZE = 100
model = SentenceTransformer('firqaaa/indo-sentence-bert-large')

uri = os.environ['uri']
db = os.environ['db']
coll = os.environ['coll']
client = MongoClient(uri)
collection = client[db][coll]
docs = collection.find({"embedding": {"$exists": False}})
total = 0

def batch_save(sentences, ids):
    for i in range(0, BATCH_SIZE): 
        # conver date type from pynum.float to float
        embedding = []
        for num in embeddings[i]: 
            embedding.append(float(num))
        operations.append(UpdateOne({
            "_id": ids[i]
        }, {
            "$set": {
                "embedding": embedding
            }
        }))
    collection.bulk_write(operations)
    total += len(sentences)
    print("Total embedding generated: " + total)

sentences = []
ids = []
operations = []
counter = 0
for doc in docs:
    sentences.append(doc["text"])
    ids.append(doc["_id"])
    counter += 1
    if counter == BATCH_SIZE:
        # get embeddings
        embeddings = model.encode(sentences)
        # batch save embeddings to MongoDB
        batch_save(sentences, ids)
        # clean up
        sentences.clear()
        ids.clear()
        operations.clear()
        counter = 0
# the last batch
if len(sentences) != 0:
    batch_save(sentences, ids)