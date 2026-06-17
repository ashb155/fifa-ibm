# Stratos: Football, Understood

**Stratos: See the Game From Above**  
An AI-powered match companion built for the IBM "AI Inside the Match" Hackathon.

Stratos is a seamless combination of two core experiences: **TactiLens** (Tactical Decision Explainer) and **FanLens** (Adaptive Multilingual Match Companion). It aims to democratize football understanding for 5 billion global fans by bridging the tactical and language gaps.

---

## 1. The Core Experiences

### Idea 2 — TactiLens: AI Tactical Decision Explainer
*(Track: Understanding & Explanation)*

**The Premise**: Coaches make 20+ in-game decisions per match—substitutions, formation shifts, pressing triggers. Casual fans don't understand them. TactiLens explains *why* in real-time.
- **What it does**: Ingests publicly available match event data (StatsBomb / Football-Data.org). The user selects a match moment on a visual timeline (e.g., "74th minute, coach pulled midfielder X, shifted to 5-4-1").
- **Output**: A "Tactical Decision Timeline" powered by D3.js. Granite generates a contextual narrative explaining the score, the threat, and the tactical logic behind the coach's decision.

### Idea 3 — FanLens: Adaptive Multilingual Match Companion
*(Track: Fan & Learning Experiences)*

**The Premise**: A fan in Brazil, India, and Germany all watch the same match with completely different levels of soccer knowledge and language. One AI companion adapts to all three.
- **What it does**: Onboarding allows the fan to select their team, knowledge level (new/casual/tactical), and language. During the match, fans ask questions in natural language ("Why was that offside?").
- **Output**: Granite answers at the precise complexity level for that user, in their native language, grounded entirely by official FIFA tournament rules ingested via Docling.

---

## 2. IBM Technology Stack Architecture

The two pipelines are fully separate: ingestion runs once at startup to build the knowledge base, while the online query path runs per request. 

### IBM Tech #1: Docling (Knowledge Base Construction)
Docling is used to convert the 230-page FIFA Laws of the Game 2024/25 PDF into structured markdown, preserving heading hierarchy, tables, and numbered lists. This markdown is split by heading level (one chunk per Law) rather than character count, ensuring that a query about "offside" retrieves the entirety of Law 11. Chunks are stored in ChromaDB using `all-MiniLM-L6-v2`.

### IBM Tech #2: Langflow (Pipeline Orchestration)
Langflow visually orchestrates the query pipeline:
1. Receives JSON payload with user query, team, knowledge level, and language.
2. Parallel execution: Fetches live match context via Football-Data.org API.
3. Retrieves Top-3 relevant chunks from ChromaDB.
4. Assembles the prompt dynamically using the retrieved rules, match context, and adaptive system prompt.
5. Sends the assembled payload to IBM Granite.

### IBM Tech #3: IBM Granite (Adaptive Response Generation)
Powered by `ibm/granite-3-8b-instruct` via the WatsonX.ai API. Granite uses highly tuned adaptive system prompts to switch personas on the fly. 
- *Beginner prompt*: Zero jargon, everyday analogies (under 90 words).
- *Tactical prompt*: Uses terms like xG, pressing triggers, and high defensive lines (up to 200 words).
Granite natively supports multilingual generation across Spanish, Portuguese, French, German, Arabic, and Hindi.

---

## 3. Demo Walkthrough Script (3 Minutes)
1. **The Problem**: Show a confusing VAR decision clip. "How many of 5 billion viewers actually understood that?" Cut to Stratos.
2. **FanLens Onboarding**: Select Argentina, choose *Beginner*, pick *Spanish*. Ask "¿Por qué anularon ese gol?" Watch Granite respond in plain Spanish with a shopping queue analogy in under 90 words.
3. **Adaptive Switch**: Switch to *Tactical* mode, ask the same question—watch Granite reference the attacker's arm position relative to the last defender's hip with frame-by-frame precision.
4. **TactiLens Timeline**: Click a node on the D3.js timeline representing a 74th-minute substitution. Granite instantly explains the tactical shift to a 5-4-1 formation to protect a 1-0 lead.
5. **Under the Hood**: Screen-record the Langflow UI executing the visual pipeline, followed by a terminal recording of IBM Docling parsing the raw FIFA Laws PDF.

---

## 4. Build Timeline (15 Days)

- **Days 1–2 (Foundation)**: GitHub setup, WatsonX API integration, Docling PDF parsing, and ChromaDB ingestion.
- **Days 3–4 (Pipeline)**: Langflow local installation, visual node building, exporting `stratos_flow.json`.
- **Days 5–6 (FastAPI)**: Skeleton backend, session management, wiring the `/chat` endpoint.
- **Days 7–8 (Prompt Engineering)**: Tuning the adaptive Beginner/Casual/Tactical Granite prompts.
- **Days 9–10 (Frontend)**: React onboarding screens, Chat interface, and D3.js Match Timeline (TactiLens).
- **Day 11 (Match Data)**: Wire live Football-Data.org event fetching.
- **Day 12 (Multilingual)**: Translation testing across top 6 World Cup languages.
- **Day 13 (Polish)**: Edge case handling, loading states, error boundaries.
- **Day 14 (Deliverables)**: Record demo video, finalize README.
- **Day 15 (Submission)**: BeMyApp platform submission.

*(Note: IBM Bob integration was bypassed due to trial access errors.)*

---

## 5. Folder Structure

```text
stratos/
├── backend/
│   ├── main.py
│   ├── api/routes/
│   │   ├── chat.py
│   │   └── session.py
│   ├── core/
│   │   ├── ingestion.py       # Docling → ChromaDB pipeline
│   │   ├── vectorstore.py     # ChromaDB query helpers
│   │   ├── granite.py         # ibm-watsonx-ai client wrapper
│   │   ├── match_context.py   # StatsBomb / Football-Data API
│   │   └── prompt_builder.py  # Adaptive system prompt selector
│   └── langflow/
│       └── stratos_flow.json  # Exported Langflow workflow
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Onboarding.jsx
│       │   ├── Timeline.jsx   # TactiLens D3.js component
│       │   └── Chat.jsx       # FanLens UI
│       └── App.jsx
├── data/
│   ├── pdfs/                  # FIFA Laws 
│   ├── team_profiles/         # Tactical summaries per team
│   └── chroma_db/             # Vector store (Ignored in Git)
├── docs/
│   └── bob_error.png          # Documentation of IBM Bob error
├── requirements.txt
└── README.md
```