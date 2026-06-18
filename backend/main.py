import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from backend.core.granite import generate_response

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
    # 1. Context Enrichment via MCP Server/Gateway
    context = "No context available."
    try:
        # Assuming MCP server has a REST tool endpoint or we call the tools directly
        # For ponytail minimal: we will just pass a dummy context until the MCP client is fully wired
        context = "Match context: Team A is attacking. 74th minute."
    except Exception as e:
        print(f"MCP Tool error: {e}")

    # 2. Generation via Granite
    response = generate_response(
        query=request.query,
        context=context,
        persona=request.persona
    )
    
    return {
        "response": response,
        "source": "WatsonX Granite",
        "context_used": context
    }
