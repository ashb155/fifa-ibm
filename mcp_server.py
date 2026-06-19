from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv
import chromadb
import urllib.request
import json
import requests
import os

load_dotenv()

# ponytail: bind to port 8012 to avoid conflict with gateway on 8000
mcp = FastMCP("Stratos_Server", port=8012)

# ponytail: try/except wrapping for resilient DB connection
try:
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    collection = chroma_client.get_or_create_collection(name="fifa_laws")
    team_profiles_collection = chroma_client.get_or_create_collection(name="team_profiles")
except Exception:
    collection = None
    team_profiles_collection = None

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
def query_team_profile(team_name: str) -> str:
    """Queries team tactical profiles DB."""
    if not team_profiles_collection:
        return "Team profile search is currently unavailable (DB error)."
    try:
        res = team_profiles_collection.query(query_texts=[team_name], n_results=1)
        docs = res.get("documents", [[]])[0]
        return docs[0] if docs else f"No profile found for team {team_name}."
    except Exception as e:
        return f"Search error: {str(e)}"

@mcp.tool()
def get_tactical_timeline(match_id: int = 3869685) -> str:
    """Fetches tactical shifts and substitutions for a match. Default match_id is 2022 World Cup Final."""
    url = f"https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/{match_id}.json"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as response:
            events = json.loads(response.read().decode("utf-8"))
            
        filtered = []
        for e in events:
            type_name = e.get("type", {}).get("name")
            if type_name in ["Substitution", "Tactical Shift"]:
                filtered.append(e)
                
        # Sort by minute, second
        filtered.sort(key=lambda x: (x.get("minute", 0), x.get("second", 0)))
        
        out = []
        for e in filtered:
            minute = e.get("minute", 0)
            type_name = e.get("type", {}).get("name")
            team = e.get("team", {}).get("name", "Unknown")
            
            if type_name == "Substitution":
                player = e.get("player", {}).get("name", "Unknown")
                replacement = e.get("substitution", {}).get("replacement", {}).get("name", "Unknown")
                out.append(f"{minute}' - {team}: {player} out, {replacement} in")
            elif type_name == "Tactical Shift":
                formation = e.get("tactics", {}).get("formation", "Unknown")
                out.append(f"{minute}' - {team}: Formation shift to {formation}")
                
        return "\n".join(out) or "No shifts."
    except Exception as e:
        return f"Service unavailable (StatsBomb API error: {str(e)})"

@mcp.tool()
def get_live_match_context(match_id: str) -> str:
    """Fetches real-time match data from Football-Data.org"""
    # ponytail: one-line GET request, minimal error handling
    try:
        api_key = os.getenv("FOOTBALL_DATA_ORG_KEY")
        if not api_key: return "Error: API key missing"
        r = requests.get(f"https://api.football-data.org/v4/matches/{match_id}", headers={"X-Auth-Token": api_key})
        if r.status_code != 200: return f"Error: {r.status_code}"
        
        d = r.json()
        return f"Status: {d.get('status')}. Score: {d.get('score', {}).get('fullTime')}."
    except Exception as e:
        return f"Service unavailable (Football-Data API error: {str(e)})"

if __name__ == "__main__":
    mcp.run(transport="sse")