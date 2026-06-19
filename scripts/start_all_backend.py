import subprocess
import time
import sys
import os
import urllib.request
import json
import signal

processes = []

def cleanup(sig=None, frame=None):
    print("\nShutting down all backend services...")
    for p in processes:
        try:
            p.terminate()
            p.wait(timeout=2)
            print(f"Terminated process {p.pid}")
        except Exception as e:
            print(f"Error terminating process {p.pid}: {e}")
    sys.exit(0)

# Register cleanup handler
signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def start_services():
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["AUTH_REQUIRED"] = "false"
    env["MCP_REQUIRE_AUTH"] = "false"
    env["ADMIN_API_ENABLED"] = "true"
    env["ADMIN_API_KEY"] = "admin123"
    env["API_ALLOW_BASIC_AUTH"] = "true"
    
    # 1. Start FastMCP server on port 8012
    print("1. Starting FastMCP Server on port 8012...")
    mcp_proc = subprocess.Popen(
        [sys.executable, "mcp_server.py"],
        env=env
    )
    processes.append(mcp_proc)
    
    # 2. Start Context Forge Gateway on port 4444
    print("2. Starting Context Forge Gateway on port 4444...")
    gateway_proc = subprocess.Popen(
        [sys.executable, "-m", "mcpgateway", "--port", "4444"],
        env=env
    )
    processes.append(gateway_proc)
    
    # Wait for gateway to initialize
    print("Waiting 3 seconds for services to boot...")
    time.sleep(3)
    
    # 3. Register mcp_server.py with Context Forge Gateway
    print("3. Registering Stratos_Server with Context Forge Gateway...")
    gateway_url = "http://127.0.0.1:4444/servers"
    payload = {
        "server": {
            "name": "Stratos_Server",
            "url": "http://127.0.0.1:8012/sse"
        }
    }
    
    req = urllib.request.Request(
        gateway_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer admin123"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            print("Successfully registered tools with Context Forge!")
            print("Gateway response:", json.dumps(res_data, indent=2))
    except Exception as e:
        print(f"Warning: Failed to register tools with gateway: {e}")
        print("Make sure Context Forge Gateway started correctly.")
        
    # 4. Start FastAPI backend on port 8000
    print("4. Starting FastAPI Backend on port 8000...")
    api_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--port", "8000"],
        env=env
    )
    processes.append(api_proc)
    
    print("\n" + "="*50)
    print("ALL SERVICES ARE ONLINE!")
    print("- Next.js Frontend: http://localhost:3000")
    print("- FastAPI Backend: http://127.0.0.1:8000")
    print("- Context Forge Gateway: http://127.0.0.1:4444")
    print("- FastMCP SSE Server: http://127.0.0.1:8012")
    print("Press Ctrl+C to terminate all services.")
    print("="*50 + "\n")
    
    # Keep main script running to monitor processes
    try:
        while True:
            for p in processes:
                if p.poll() is not None:
                    print(f"Warning: Process {p.pid} terminated early with code {p.returncode}")
            time.sleep(5)
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    start_services()
