import chromadb
from docling.document_converter import DocumentConverter
from docling.chunking import HybridChunker

# ponytail: docling used strictly to satisfy hackathon requirement.
def ingest():
    converter = DocumentConverter()
    result = converter.convert("laws.md")
    
    chunker = HybridChunker(max_tokens=512, merge_peers=True)
    chunks = list(chunker.chunk(result.document))

    client = chromadb.PersistentClient(path="./chroma_db")
    collection = client.get_or_create_collection("fifa_laws")
    
    # ponytail: one-line list comprehensions for extraction
    docs = [c.text for c in chunks]
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"source": "laws.md"} for _ in chunks]

    collection.add(documents=docs, ids=ids, metadatas=metadatas)
    print(f"Ingested {len(docs)} chunks.")

if __name__ == "__main__":
    ingest()
