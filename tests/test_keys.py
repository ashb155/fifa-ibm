import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
import requests

load_dotenv()

def test_football_data():
    api_key = os.getenv("FOOTBALL_DATA_ORG_KEY")
    if not api_key: return "Missing FOOTBALL_DATA_ORG_KEY"
    try:
        r = requests.get("https://api.football-data.org/v4/competitions", headers={"X-Auth-Token": api_key})
        if r.status_code == 200:
            return "Football-Data API Key: OK"
        return f"Football-Data API Key: FAILED ({r.status_code})"
    except Exception as e:
        return f"Football-Data API Key: FAILED ({e})"

def test_watsonx():
    from backend.core.granite import generate_response
    res = generate_response("Say hello", "casual", "English", "No context")
    if "Error" in res or "failed" in res.lower():
        return f"WatsonX API Key: FAILED ({res})"
    return f"WatsonX API Key: OK (Response: '{res[:30]}...')"

print(test_football_data())
print(test_watsonx())
