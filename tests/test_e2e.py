import subprocess
import time
import requests
import sys

print("Starting MCP Server...")
mcp_proc = subprocess.Popen([sys.executable, "mcp_server.py"])
time.sleep(2)

print("Starting FastAPI Backend...")
api_proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "backend.main:app", "--port", "8000"])
time.sleep(3)

errors = 0

try:
    print("Testing /match/current...")
    r = requests.get("http://127.0.0.1:8000/match/current")
    print(f"Status: {r.status_code}, Response: {r.json()}")
    if r.status_code != 200: errors += 1

    print("Testing /timeline/3869685...")
    r = requests.get("http://127.0.0.1:8000/timeline/3869685")
    print(f"Status: {r.status_code}, Response: {r.json()}")
    if r.status_code != 200: errors += 1

    print("Testing /chat (without Langflow running)...")
    r = requests.post("http://127.0.0.1:8000/chat", json={"query": "Hello"})
    print(f"Status: {r.status_code}, Response: {r.json()}")
    if r.status_code != 200: errors += 1
    
    # We expect the /chat endpoint to handle missing Langflow gracefully and return 200 
    # with an "Error calling Langflow API" in the response body.
    if "Error" not in r.json().get("source", ""):
        print("Warning: Expected Langflow to be missing, but got a different response.")

except Exception as e:
    print(f"Exception during tests: {e}")
    errors += 1

finally:
    print("Shutting down servers...")
    mcp_proc.terminate()
    api_proc.terminate()

if errors == 0:
    print("ALL ENDPOINTS WORKED GRACEFULLY!")
else:
    print(f"FOUND {errors} ERRORS.")
