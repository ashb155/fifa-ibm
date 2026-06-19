import os
import chromadb
import contextlib
from docling.document_converter import DocumentConverter
from docling.chunking import HybridChunker

def ingest_profiles():
    client = chromadb.PersistentClient(path="./chroma_db")
    with contextlib.suppress(Exception):
        client.delete_collection("team_profiles")
    collection = client.create_collection("team_profiles")
    
    converter = DocumentConverter()
    chunker = HybridChunker(max_tokens=512, merge_peers=True)
    
    profiles_dir = "docs/team_profiles"
    if not os.path.exists(profiles_dir):
        print(f"Error: Directory {profiles_dir} not found.")
        return

    docs, ids, metadatas = [], [], []
    doc_id = 0
    
    for filename in os.listdir(profiles_dir):
        if filename.endswith(".md"):
            filepath = os.path.join(profiles_dir, filename)
            team_name = filename.replace("_", " ").replace(".md", "")
            
            result = converter.convert(filepath)
            chunks = list(chunker.chunk(result.document))
            
            for c in chunks:
                docs.append(c.text)
                ids.append(f"profile_chunk_{doc_id}")
                metadatas.append({"source": filepath, "team": team_name})
                doc_id += 1
                
    if docs:
        collection.add(documents=docs, ids=ids, metadatas=metadatas)
        print(f"Ingested {len(docs)} chunks across {doc_id} items into team_profiles collection.")
    else:
        print("No documents were found to ingest.")

if __name__ == "__main__":
    ingest_profiles()
