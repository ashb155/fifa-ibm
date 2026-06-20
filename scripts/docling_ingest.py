import chromadb
from docling.document_converter import DocumentConverter
from docling.chunking import HybridChunker

def ingest():
    converter = DocumentConverter()
    result = converter.convert("docs/laws.md")
    
    chunker = HybridChunker(max_tokens=512, merge_peers=True)
    chunks = list(chunker.chunk(result.document))

    client = chromadb.PersistentClient(path="./chroma_db")
    collection = client.get_or_create_collection("fifa_laws")

    docs, ids, metadatas = [], [], []
    for i, c in enumerate(chunks):
        docs.append(c.text)
        ids.append(f"laws_chunk_{i}")

        heading = "General"
        if hasattr(c, "meta") and hasattr(c.meta, "headings") and c.meta.headings:
            heading = c.meta.headings[0]

        metadatas.append({
            "source": "laws.md",
            "document_type": "regulation",
            "section": heading,
            "token_length": len(c.text.split())
        })
    collection.add(documents=docs, ids=ids, metadatas=metadatas)
    print(f"Ingested {len(docs)} chunks.")

if __name__ == "__main__":
    ingest()
