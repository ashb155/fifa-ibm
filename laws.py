import chromadb
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("fifa_laws")

query = "What are the offside rules?"
embedding = model.encode(query).tolist()

results = collection.query(query_embeddings=[embedding], n_results=3)

for i, doc in enumerate(results["documents"][0]):
    print(f"\n--- Chunk {i+1} ---")
    print(doc[:300])
