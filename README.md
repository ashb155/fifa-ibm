# Stratos: Football, Understood.

**Stratos: See the Game From Above**
An AI-powered match companion built for the IBM "AI Inside the Match" Hackathon.

## The Problem
Football is a global game, but the way we consume it is fragmented by language and tactical literacy. 
1. **The Tactical Gap (Idea 2 - TactiLens)**: Coaches make 20+ in-game decisions per match (substitutions, formation shifts, pressing triggers). Casual fans don't understand them. 
2. **The Language & Knowledge Gap (Idea 3 - FanLens)**: A fan in Brazil, India, and Germany all watch the same match with completely different levels of soccer knowledge and language. 

Current broadcasting and apps give everyone the exact same feed. **Stratos gives every fan a personalized AI companion that explains the game at their exact level of understanding, in their native language.**

## What it Does
Stratos merges two core experiences into one app:
- **TactiLens (Tactical Decision Explainer)**: Analyzes match event data (StatsBomb/Football-Data.org) and generates a contextual narrative explaining *why* a coach made a specific decision (e.g., "74th minute, shifted to 5-4-1").
- **FanLens (Adaptive Multilingual Companion)**: Allows fans to ask natural language questions ("Why was that offside?") and receives answers perfectly tuned to their selected persona (Beginner, Casual, Tactical) and language.

## Technical Approach & IBM Stack

Stratos leverages the required IBM technology stack to achieve a production-grade architecture:

- **IBM Docling**: Used to ingest and semantically chunk the official FIFA Laws of the Game PDF and tournament regulations (`docling_ingest.py`). These chunks provide grounded truth to prevent LLM hallucinations.
- **IBM Granite (watsonx.ai)**: The core reasoning engine. We utilize Granite 3.1 8B Instruct for its exceptional multilingual capabilities and instruction-following, allowing it to dynamically switch tone between a "Beginner" explanation and a "Tactical" deep-dive (`granite.py`).
- **Langflow**: The visual orchestration layer (`stratos_flow.json`). It manages the pipeline: user input → prompt enrichment → MCP tool execution → Granite generation → UI delivery.
- **Context Forge / FastMCP**: Our Python server (`mcp_server.py`) exposes tools (StatsBomb timeline retrieval, ChromaDB vector search) over the Model Context Protocol.

## Why It Matters
"Real-world impact at global scale" is the ultimate goal. By combining multilingual NLP with dynamic complexity adjustment, Stratos bypasses traditional sporting jargon. It democratizes football tactics, making the world's most popular sport accessible to absolutely anyone, anywhere.

---

### Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
2. **Environment Variables**
   Copy `.env.example` to `.env` and add your WatsonX credentials.
3. **Start the MCP Server**
   ```bash
   python mcp_server.py
   ```
   *Note: Langflow will connect to this directly via `http://127.0.0.1:8000/sse`.*
4. **Import Langflow**
   Import `stratos_flow.json` into your local Langflow instance.