import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import sys

load_dotenv()

# ponytail: ensure root is in path for mcp_server import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from mcp_server import get_live_match_context, get_tactical_timeline, get_nearest_world_cup_match
except ImportError:
    pass

app = FastAPI(title="Stratos Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str
    persona: str = "casual"
    language: str = "English"

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Go to /docs to test endpoints."
    }

import uuid
class SessionCreate(BaseModel):
    team: str
    knowledge_level: str
    language: str

@app.post("/session/create")
async def create_session(session: SessionCreate):
    # The backend is fully stateless. State is maintained by React Context in the frontend.
    # This endpoint satisfies the PRD API spec and provides a unique ID for the frontend to track.
    return {
        "session_id": str(uuid.uuid4()),
        "status": "created",
        "message": "Session created. Please pass language and persona in /chat payloads."
    }

@app.get("/match/current")
async def get_current_match():
    try:
        res = await get_nearest_world_cup_match()
        return {"status": "success", "match": res}
    except Exception as e:
        return {"status": "error", "match": str(e)}

@app.get("/timeline/{match_id}")
async def get_timeline(match_id: str):
    try:
        res = await get_tactical_timeline(match_id=int(match_id))
        return {"timeline": res}
    except Exception as e:
        return {"timeline": f"Error: {str(e)}"}

@app.post("/chat")
async def chat(request: ChatRequest):
    # Call the Langflow REST API instead of bypassing it
    langflow_url = os.getenv("LANGFLOW_API_URL", "http://127.0.0.1:7860/api/v1/run/Stratos")
    
    payload = {
        "input_value": request.query,
        "input_type": "chat",
        "output_type": "chat",
        "tweaks": {
            "Prompt-1": {
                "knowledge_level": request.persona,
                "language": request.language
            }
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # Note: Awaiting Langflow to process the flow
            lf_response = await client.post(langflow_url, json=payload, timeout=60.0)
            lf_response.raise_for_status()
            result = lf_response.json()
            
            # Extract response from Langflow output format
            # This is a safe parsing logic depending on Langflow's nested JSON
            try:
                message = result["outputs"][0]["outputs"][0]["results"]["message"]["text"]
            except KeyError:
                message = str(result)
                
            return {
                "response": message,
                "source": "Langflow Orchestration (Granite + Context Forge)"
            }
    except Exception as e:
        print(f"Langflow failed: {e}. Falling back to direct Granite.")
        try:
            from backend.core.watsonx_client import generate_response
            import chromadb
            
            context = ""
            try:
                chroma_client = chromadb.PersistentClient(path="./chroma_db")
                team_col = chroma_client.get_collection(name="team_profiles")
                res = team_col.query(query_texts=[request.query], n_results=1)
                docs = res.get("documents", [[]])[0]
                if docs:
                    context = docs[0]
            except Exception as db_e:
                print(f"Chroma fallback failed: {db_e}")
                
            fallback_response = generate_response(request.query, request.persona, request.language, context)
            return {
                "response": fallback_response,
                "source": "Direct Granite Fallback"
            }
        except Exception as fallback_e:
            return {
                "response": f"Error calling Langflow API and fallback failed: {str(e)}\nFallback error: {str(fallback_e)}",
                "source": "Error"
            }
