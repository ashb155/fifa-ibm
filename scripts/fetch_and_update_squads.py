import os
import json
import requests
from dotenv import load_dotenv

load_dotenv('.env')

def main():
    api_key = os.getenv('FOOTBALL_DATA_ORG_KEY')
    if not api_key:
        print("Missing FOOTBALL_DATA_ORG_KEY")
        return
        
    print("Fetching teams from Football-Data.org...")
    r = requests.get('https://api.football-data.org/v4/competitions/WC/teams', headers={'X-Auth-Token': api_key})
    r.raise_for_status()
    teams = r.json().get('teams', [])
    
    print(f"Found {len(teams)} teams.")
    
    teams_dict = {}
    for t in teams:
        name = t.get('name', 'Unknown')
        coach = t.get('coach', {}).get('name', 'Unknown Coach')
        if not coach:
            coach = "Unknown Coach"
            
        squad = t.get('squad', [])
        player_names = [p.get('name', 'Unknown') for p in squad]
        
        teams_dict[name] = {
            'coach': coach,
            'players': player_names,
            'formation': '4-3-3',
            'style': 'Balanced tactical approach.'
        }
        
    print(f"Processed {len(teams_dict)} teams.")
    
    # Now generate the new generate_real_profiles.py script
    script_content = f"""import os
import random

TEAMS_48 = {json.dumps(teams_dict, indent=4)}

def generate_profiles():
    output_dir = os.path.join("docs", "team_profiles")
    os.makedirs(output_dir, exist_ok=True)
    
    for team, data in TEAMS_48.items():
        coach = data.get("coach", "Unknown Coach")
        # Ensure we handle empty squad cases just in case
        players = data.get("players", [])
        if not players:
            players = ["Unknown Player"]
            
        players_str = ", ".join(players)
        formation = data.get("formation", "4-3-3")
        style = data.get("style", "Balanced tactical approach")
        
        defensive_tactic = "Aggressive high block" if "press" in style.lower() else "Disciplined mid/low block"
        attacking_tactic = "Vertical and direct" if "direct" in style.lower() or "counter" in style.lower() else "Patient build-up and positional play"
        
        profile_content = f\"\"\"# Team Profile: {{team}}

## General Overview
- **Manager**: {{coach}}
- **Key Players**: {{players_str}}
- **Preferred Formation**: {{formation}}
- **Tactical Identity**: {{style}}

## Tactical Breakdown
### Attacking Phase
{{team}} implements a {{attacking_tactic.lower()}} approach. Operating primarily in a {{formation}} shape, the midfield looks to establish dominance early. When progressing the ball, they look for {{players[0]}} to act as the primary catalyst.

### Defensive Structure
Defensively, they utilize a {{defensive_tactic.lower()}}. The defensive line coordinates closely with the midfield pivot to deny space between the lines. {{coach}} demands extreme discipline out of possession.

### Transitions
In transition moments, {{team}} excels at immediate reactions. Offensively, they target the half-spaces instantly upon regaining the ball. Defensively, they attempt to cut off passing lanes and delay the opposition to reform their {{formation}} structure.
\"\"\"
        filepath = os.path.join(output_dir, f"{{team.replace(' ', '_')}}.md")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(profile_content)
            
    print(f"Successfully generated {{len(TEAMS_48)}} detailed tactical profiles in {{output_dir}}")

if __name__ == "__main__":
    generate_profiles()
"""
    
    with open('scripts/generate_real_profiles.py', 'w', encoding='utf-8') as f:
        f.write(script_content)
        
    print("Updated scripts/generate_real_profiles.py successfully!")

if __name__ == '__main__':
    main()
