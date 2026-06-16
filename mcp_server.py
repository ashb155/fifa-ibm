from mcp.server.fastmcp import FastMCP
import chromadb
from statsbombpy import sb
import requests
import sys

mcp = FastMCP("Stratos_Server")
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="fifa_laws")

@mcp.tool()
def query_football_laws(query: str) -> str:
    """Queries IFAB Laws vector DB."""
    res = collection.query(query_texts=[query], n_results=3)
    docs = res.get("documents", [[]])[0]
    return "\n\n".join(docs) if docs else "No rules found."

@mcp.tool()
def get_tactical_timeline(match_id: int) -> str:
    """Fetches tactical shifts and substitutions for a match."""
    df = sb.events(match_id=match_id)
    if 'type' not in df.columns: return "No events."
    
    # ponytail: pandas dataframe filtering, fastest path
    df = df[df['type'].isin(['Substitution', 'Tactical Shift'])].sort_values(['minute', 'second'])
    
    out = []
    for _, r in df.iterrows():
        if r['type'] == 'Substitution':
            out.append(f"{r['minute']}' - {r.get('team')}: {r.get('player')} out, {r.get('substitution_replacement')} in")
        else:
            fmt = r.get('tactics', {}).get('formation') if isinstance(r.get('tactics'), dict) else 'Unknown'
            out.append(f"{r['minute']}' - {r.get('team')}: Formation shift to {fmt}")
    return "\n".join(out) or "No shifts."

@mcp.tool()
def get_live_match_context(match_id: str, api_key: str) -> str:
    """Fetches real-time match data from Football-Data.org"""
    # ponytail: one-line GET request, minimal error handling
    r = requests.get(f"https://api.football-data.org/v4/matches/{match_id}", headers={"X-Auth-Token": api_key})
    if r.status_code != 200: return f"Error: {r.status_code}"
    
    d = r.json()
    return f"Status: {d.get('status')}. Score: {d.get('score', {}).get('fullTime')}."

if __name__ == "__main__":
    mcp.run(transport="stdio")