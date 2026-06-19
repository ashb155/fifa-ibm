import chromadb

try:
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
except Exception as e:
    print(f"Warning: Global ChromaDB initialization failed: {e}")
    chroma_client = None

def get_collection(name: str):
    if chroma_client is None:
        return None
    try:
        return chroma_client.get_collection(name=name)
    except Exception as e:
        print(f"Warning: Could not get collection {name}: {e}")
        return None
