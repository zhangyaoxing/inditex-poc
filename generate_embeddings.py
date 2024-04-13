from sentence_transformers import SentenceTransformer
from pymongo.mongo_client import MongoClient
from pymongo import UpdateOne
import os
import time

BATCH_SIZE = 10
uri = os.environ['uri']
db = os.environ['db']
coll = os.environ['coll']
local_path = os.environ['local_path']
client = MongoClient(uri)
collection = client[db][coll]
docs = collection.find({"embedding": {"$exists": False}})
total = 0


model = SentenceTransformer('firqaaa/indo-sentence-bert-large')
# model.save(local_path)
# model = SentenceTransformer(local_path)

def batch_save(sentences, ids):
    global total
    ms = time.time_ns()
    # get embeddings
    embeddings = model.encode(sentences)
    print("Embeddings generated for: " + str(BATCH_SIZE) + " Items")
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
    ms = (time.time_ns() - ms) / 1000000
    total += len(sentences)
    print(str(total) + " items saved to database. Total time spent: " + str(ms) + "ms")

sentences = []
ids = []
operations = []
counter = 0
for doc in docs:
    sentences.append(doc["text"])
    ids.append(doc["_id"])
    counter += 1
    if counter == BATCH_SIZE:
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