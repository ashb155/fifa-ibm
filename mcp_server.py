from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv
import httpx
import os

load_dotenv()

# ponytail: bind to port 8012 to avoid conflict with gateway on 8000 — 7 MCP tools
mcp = FastMCP("Stratos_Server", port=8012)

from backend.core.db import get_collection

# ponytail: try/except wrapping for resilient DB connection handled by db.py now
collection = get_collection("fifa_laws")
team_profiles_collection = get_collection("team_profiles")

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
    if not team_name or not team_name.strip():
        return "Error: team_name must be a non-empty string."
    if not team_profiles_collection:
        return "Team profile search is currently unavailable (DB error)."
    try:
        res = team_profiles_collection.query(query_texts=[team_name], n_results=1)
        docs = res.get("documents", [[]])[0]
        return docs[0] if docs else f"No profile found for team {team_name}."
    except Exception as e:
        return f"Search error: {str(e)}"

@mcp.tool()
async def get_tactical_timeline(match_id: int = 3869685) -> str:
    """Fetches tactical shifts and substitutions for a match. Default match_id is 2022 World Cup Final."""
    if match_id <= 0:
        return "Error: match_id must be a positive integer."
    url = f"https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/{match_id}.json"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            response.raise_for_status()
            events = response.json()
            
        filtered = [e for e in events if e.get("type", {}).get("name") in ["Substitution", "Tactical Shift"]]
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

async def _fetch_football_data(url: str) -> dict:
    """Shared helper to fetch from Football-Data.org."""
    api_key = os.getenv("FOOTBALL_DATA_ORG_KEY")
    if not api_key:
        raise ValueError("API key missing")
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url, headers={"X-Auth-Token": api_key})
        r.raise_for_status()
        return r.json()

@mcp.tool()
async def get_live_match_context(match_id: str) -> str:
    """Fetches real-time match data from Football-Data.org"""
    if not match_id or not match_id.strip():
        return "Error: match_id must be a non-empty string."
    try:
        d = await _fetch_football_data(f"https://api.football-data.org/v4/matches/{match_id}")
        return f"Status: {d.get('status')}. Score: {d.get('score', {}).get('fullTime')}."
    except Exception as e:
        return f"Service unavailable (Football-Data API error: {str(e)})"

@mcp.tool()
async def get_competition_standings(competition_id: str) -> str:
    """Fetches current standings for a competition from Football-Data.org (e.g. 'PL' for Premier League)."""
    try:
        d = await _fetch_football_data(f"https://api.football-data.org/v4/competitions/{competition_id}/standings")
        standings = d.get('standings', [])
        if not standings: return "No standings available."
        
        # Format the top 5 teams of the first table
        table = standings[0].get('table', [])[:5]
        out = [f"Top 5 {competition_id} Standings:"]
        for row in table:
            pos = row.get('position')
            team = row.get('team', {}).get('name')
            pts = row.get('points')
            out.append(f"{pos}. {team} ({pts} pts)")
        return "\n".join(out)
    except Exception as e:
        return f"Service unavailable (Football-Data API error: {str(e)})"

@mcp.tool()
async def get_team_matches(team_id: str, status: str = "SCHEDULED") -> str:
    """Fetches matches for a specific team (e.g. Real Madrid '86'). Status can be SCHEDULED, FINISHED, LIVE."""
    try:
        d = await _fetch_football_data(f"https://api.football-data.org/v4/teams/{team_id}/matches?status={status}&limit=5")
        matches = d.get('matches', [])
        if not matches: return f"No {status} matches found."
        
        out = [f"Next 5 {status} matches:"]
        for m in matches:
            home = m.get('homeTeam', {}).get('name')
            away = m.get('awayTeam', {}).get('name')
            date = m.get('utcDate', '')[:10]
            out.append(f"{date}: {home} vs {away}")
        return "\n".join(out)
    except Exception as e:
        return f"Service unavailable (Football-Data API error: {str(e)})"

@mcp.tool()
async def get_nearest_world_cup_match() -> str:
    """Fetches the nearest (LIVE or upcoming SCHEDULED) World Cup match."""
    try:
        try:
            d = await _fetch_football_data("https://api.football-data.org/v4/competitions/WC/matches?status=LIVE")
            matches = d.get("matches", [])
        except Exception:
            matches = []
            
        if not matches:
            try:
                d = await _fetch_football_data("https://api.football-data.org/v4/competitions/WC/matches?status=SCHEDULED")
                matches = d.get("matches", [])
            except Exception:
                pass
                
        if not matches:
            return "No LIVE or SCHEDULED World Cup matches found."
            
        m = matches[0]
        home = m.get('homeTeam', {}).get('name', 'Unknown')
        away = m.get('awayTeam', {}).get('name', 'Unknown')
        date = m.get('utcDate', '')
        status = m.get('status', 'UNKNOWN')
        score = m.get('score', {}).get('fullTime')
        
        out = f"Match: {home} vs {away} | Status: {status} | Time: {date}"
        if score and status != "SCHEDULED":
            out += f" | Score: {score}"
        return out
    except Exception as e:
        return f"Service unavailable (Football-Data API error: {str(e)})"

if __name__ == "__main__":
    mcp.run(transport="sse")