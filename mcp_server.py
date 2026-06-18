from mcp.server.fastmcp import FastMCP
import chromadb
from statsbombpy import sb
import requests
import sys

# ponytail: bind to port 8012 to avoid conflict with gateway on 8000
mcp = FastMCP("Stratos_Server", port=8012)

# ponytail: try/except wrapping for resilient DB connection
try:
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    collection = chroma_client.get_or_create_collection(name="fifa_laws")
except Exception as e:
    sys.stderr.write(f"Chroma DB initialization failed: {e}\n")
    collection = None

@mcp.tool()
def query_football_laws(query: str) -> str:
    """Queries IFAB Laws vector DB."""
    if not collection:
        return "Football laws search is currently unavailable (DB error)."
    try:
        res = collection.query(query_texts=[query], n_results=3)
        docs = res.get("documents", [[]])[0]
        return "\n\n".join(docs) if docs else "No rules found."
    except Exception as e:
        return f"Search error: {str(e)}"

@mcp.tool()
def get_tactical_timeline(match_id: int = 3869685) -> str:
    """Fetches tactical shifts and substitutions for a match. Default match_id is 2022 World Cup Final."""
    try:
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
    except Exception as e:
        return f"Service unavailable (StatsBomb API error: {str(e)})"

@mcp.tool()
def get_live_match_context(match_id: str, api_key: str) -> str:
    """Fetches real-time match data from Football-Data.org"""
    # ponytail: one-line GET request, minimal error handling
    try:
        r = requests.get(f"https://api.football-data.org/v4/matches/{match_id}", headers={"X-Auth-Token": api_key})
        if r.status_code != 200: return f"Error: {r.status_code}"
        
        d = r.json()
        return f"Status: {d.get('status')}. Score: {d.get('score', {}).get('fullTime')}."
    except Exception as e:
        return f"Service unavailable (Football-Data API error: {str(e)})"

if __name__ == "__main__":
    mcp.run(transport="sse")