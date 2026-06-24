import os
import sys
import uuid
from typing import List, Dict, Optional


import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.core.auth import init_auth_db, get_db, hash_password, verify_password, create_access_token, verify_token

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
    {"name": "auth", "description": "User authentication & profiles"},
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
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_auth_db()

# --- Pydantic request models ---

class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class ProfileRequest(BaseModel):
    team: str
    level: str
    language: str

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

MATCHES_URL = "https://raw.githubusercontent.com/statsbomb/open-data/master/data/matches/43/106.json"
cached_matches = None

async def fetch_all_matches():
    global cached_matches
    if cached_matches is not None:
        return cached_matches
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(MATCHES_URL, headers={"User-Agent": "Mozilla/5.0"})
            r.raise_for_status()
            cached_matches = r.json()
            # Sort by match_date descending so most recent match is first
            cached_matches.sort(key=lambda x: x.get("match_date", ""), reverse=True)
            return cached_matches
    except Exception as e:
        print(f"Error fetching matches from StatsBomb: {e}")
        return []

@app.get("/matches/search", tags=["match"])
async def search_matches(q: Optional[str] = None):
    matches = await fetch_all_matches()
    if not matches:
        return {"status": "success", "matches": []}
    
    if not q or not q.strip():
        return {"status": "success", "matches": matches}
        
    q_lower = q.lower().strip()
    filtered = []
    for m in matches:
        home = m.get("home_team", {}).get("home_team_name", "").lower()
        away = m.get("away_team", {}).get("away_team_name", "").lower()
        if (q_lower in home or 
            q_lower in away or 
            q_lower in f"{home} vs {away}" or 
            q_lower in f"{away} vs {home}"):
            filtered.append(m)
            
    return {"status": "success", "matches": filtered}

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
    langflow_url = os.getenv("LANGFLOW_API_URL")
    langflow_api_key = os.getenv("LANGFLOW_API_KEY")

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

    headers = {}
    if langflow_api_key:
        headers["x-api-key"] = langflow_api_key

    try:
        async with httpx.AsyncClient() as client:
            lf_response = await client.post(langflow_url, json=payload, headers=headers, timeout=30.0)
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
        print(f"Langflow failed or offline. Error: {e}")
        try:
            print(f"Response content: {lf_response.text}")
        except:
            pass
        print("Falling back to direct Granite.")
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

@app.post("/auth/register", tags=["auth"])
async def register(request: RegisterRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ?", (request.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed = hash_password(request.password)
    cursor.execute(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        (request.username, hashed)
    )
    conn.commit()
    conn.close()
    return {"status": "success", "message": "User registered successfully"}

@app.post("/auth/login", tags=["auth"])
async def login(request: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT username, password_hash, team, level, language FROM users WHERE username = ?",
        (request.username,)
    )
    user = cursor.fetchone()
    conn.close()
    
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_access_token(user["username"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "team": user["team"],
            "level": user["level"],
            "language": user["language"]
        }
    }

@app.get("/auth/me", tags=["auth"])
async def get_me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    username = verify_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT username, team, level, language FROM users WHERE username = ?",
        (username,)
    )
    user = cursor.fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "username": user["username"],
        "team": user["team"],
        "level": user["level"],
        "language": user["language"]
    }

@app.post("/auth/profile", tags=["auth"])
async def update_profile(request: ProfileRequest, authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    username = verify_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET team = ?, level = ?, language = ? WHERE username = ?",
        (request.team, request.level, request.language, username)
    )
    conn.commit()
    
    cursor.execute(
        "SELECT username, team, level, language FROM users WHERE username = ?",
        (username,)
    )
    user = cursor.fetchone()
    conn.close()
    return {
        "status": "success",
        "user": {
            "username": user["username"],
            "team": user["team"],
            "level": user["level"],
            "language": user["language"]
        }
    }
