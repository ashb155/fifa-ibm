import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx

app = FastAPI(title="Stratos Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str
    persona: str = "casual"
    language: str = "English"

class SessionCreate(BaseModel):
    match_id: str

@app.post("/session/create")
async def create_session(session: SessionCreate):
    return {"session_id": "mock_session_123", "match_id": session.match_id}

@app.patch("/session/{session_id}")
async def update_session(session_id: str, data: dict):
    return {"status": "updated", "session_id": session_id}

@app.get("/match/current")
async def get_current_match():
    # Placeholder for Football-Data.org live match
    return {"status": "live", "match": "Example Match"}

@app.get("/timeline/{match_id}")
async def get_timeline(match_id: str):
    # Placeholder for StatsBomb timeline
    return {"timeline": []}

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
        return {
            "response": f"Error calling Langflow API: {str(e)}\nPlease ensure Langflow is running and stratos_flow.json is imported.",
            "source": "Error"
        }
