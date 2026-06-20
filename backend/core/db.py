import os
import chromadb

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, "../../"))
db_path = os.path.join(root_dir, "chroma_db")

try:
    chroma_client = chromadb.PersistentClient(path=db_path)
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


def query_laws(query_text: str, n_results: int = 4, section_filter: str = None) -> list:
    """
    Queries the FIFA laws collection. Optionally filters by a specific document section.
    """
    collection = get_collection("fifa_laws")
    if not collection:
        print("Error: Collection 'fifa_laws' not found.")
        return []

    where_clause = None
    if section_filter:
        where_clause = {"section": section_filter}

    try:
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where_clause
        )

        if results and "documents" in results and results["documents"]:
            return results["documents"][0]
        return []
    except Exception as e:
        print(f"Query failed: {e}")
        return []