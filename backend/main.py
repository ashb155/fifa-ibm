import os
import sys
import uuid
from typing import List, Dict, Optional


import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

# ponytail: ensure root is in path for mcp_server import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from mcp_server import get_live_match_context, get_tactical_timeline, get_nearest_world_cup_match
except ImportError:
    pass

# --- OpenAPI metadata ---
tags_metadata = [
    {"name": "health", "description": "Service health checks"},
    {"name": "session", "description": "Session management"},
    {"name": "match", "description": "Live match data"},
    {"name": "timeline", "description": "Tactical timeline data"},
    {"name": "chat", "description": "AI chat interface"},
]

app = FastAPI(
    title="Stratos Backend",
    description="AI-powered FIFA World Cup companion API — tactical analysis, live match context, and adaptive chat.",
    version="0.1.0",
    openapi_tags=tags_metadata,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic request models ---

class ChatRequest(BaseModel):
    query: str
    persona: str = "casual"
    language: str = "English"
    history: Optional[List[Dict[str, str]]] = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "query": "What is the offside rule?",
                    "persona": "beginner",
                    "language": "English",
                    "history": [],
                }
            ]
        }
    }

# --- Pydantic response models ---

class ChatResponse(BaseModel):
    response: str
    source: str

class MatchResponse(BaseModel):
    status: str
    match: str

class TimelineResponse(BaseModel):
    timeline: str

# --- Initialize ChromaDB collection globally to avoid severe disk I/O lag on every request ---
from backend.core.db import get_collection, chroma_client, query_laws
team_col = get_collection("team_profiles")

# --- Endpoints ---

@app.get("/", tags=["health"])
async def root():
    return {
        "status": "online",
        "message": "Go to /docs to test endpoints."
    }

@app.get("/health", tags=["health"])
async def health():
    return {
        "status": "healthy",
        "chroma_db": chroma_client is not None,
        "services": {
            "langflow": os.getenv("LANGFLOW_API_URL", "http://127.0.0.1:7860/api/v1/run/Stratos"),
            "watsonx": bool(os.getenv("WATSONX_API_KEY")),
        },
    }

@app.get("/match/current", response_model=MatchResponse, tags=["match"])
async def get_current_match():
    try:
        res = await get_nearest_world_cup_match()
        return {"status": "success", "match": res}
    except Exception as e:
        return {"status": "error", "match": str(e)}

@app.get("/timeline/{match_id}", response_model=TimelineResponse, tags=["timeline"])
async def get_timeline(match_id: str):
    try:
        res = await get_tactical_timeline(match_id=int(match_id))
        return {"timeline": res}
    except Exception as e:
        return {"timeline": f"Error: {str(e)}"}


@app.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat(request: ChatRequest):
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
            lf_response = await client.post(langflow_url, json=payload, timeout=30.0)
            lf_response.raise_for_status()
            result = lf_response.json()

            try:
                message = result["outputs"][0]["outputs"][0]["results"]["message"]["text"]
            except KeyError:
                message = str(result)

            return {
                "response": message,
                "source": "Langflow Orchestration (Granite + Context Forge)"
            }

    except Exception as e:
        print(f"Langflow failed or offline. Falling back to direct Granite.")
        try:
            from backend.core.watsonx_client import generate_response

            context_str = ""

            # A) Query FIFA Laws
            retrieved_rules = query_laws(query_text=request.query, n_results=2)
            if retrieved_rules:
                context_str += "FIFA RULEBOOK CONTEXT (Strict Instruction: ONLY use this context if it directly answers the user's question. If unrelated, ignore it entirely):\n"
                context_str += "\n---\n".join(retrieved_rules) + "\n\n"

            # B) Query Team Profiles
            if team_col:
                try:
                    res = team_col.query(query_texts=[request.query], n_results=1)
                    docs = res.get("documents", [[]])[0]
                    if docs:
                        context_str += f"TEAM PROFILE CONTEXT:\n{docs[0]}\n"
                except Exception as db_e:
                    print(f"Chroma team query failed: {db_e}")

            fallback_response = generate_response(
                query=request.query,
                persona=request.persona,
                language=request.language,
                context=context_str,
                history=request.history
            )
            return {
                "response": fallback_response,
                "source": "Direct Granite Fallback + RAG" if context_str else "Direct Granite Fallback"
            }
        except Exception as fallback_e:
            return {
                "response": f"System error. Langflow unavailable and fallback failed: {str(fallback_e)}",
                "source": "Error"
            }
