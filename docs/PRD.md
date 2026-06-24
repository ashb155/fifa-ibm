# Stratos: Football, Understood
### Product Requirements & Implementation Document
**IBM AI Builders Challenge — June 2026 Innovation Challenge**
**Authors:** Aneesh Venkatesha Rao & Ashutosh Bhat
**Deadline:** June 30, 2026, 11:59 PM ET
**Document Date:** June 24, 2026 (Completed)

---

## 1. Executive Summary

Stratos is an AI-powered football companion built for the IBM AI Builders Challenge "AI Inside the Match" theme. It solves a single problem from two angles at once: billions of people watch the same football match and understand almost none of it the same way. A casual fan in Brazil doesn't know what offside means. A tactical fan in Germany wants to know why the coach made a substitution in the 74th minute. Stratos answers both, in the fan's own language, at the fan's own level of football fluency, grounded in real match data and the actual Laws of the Game — not generic LLM guesswork.

It is built entirely on IBM's required technology stack — Granite, Docling, Langflow, Context Forge, and (where access allows) IBM Bob — and is designed to score well against all four official judging criteria: Technical Execution, Innovation, Challenge Fit, and Implementation & Feasibility.

---

## 2. Problem Statement

During the World Cup, the same 90 minutes are experienced as completely different events depending on who is watching. A new fan sees a player flagged offside and has no idea why. A casual fan sees a coach change a formation and doesn't register that anything happened at all. A tactical fan watching the same moment is frustrated that broadcast commentary never explains the actual tactical logic. 

None of these fans speak the same football vocabulary, and most platforms — score trackers, fantasy apps, static dashboards — don't address comprehension at all. They report *what* happened. They never explain *why*, and they never adapt to *who is asking*.

The official challenge explicitly excludes pure prediction engines, static dashboards, and opaque AI systems as out of scope. Stratos is built specifically to avoid all three: every output is explainable, grounded in retrieved source material (real Laws of the Game text, real match events), and adaptive to the individual fan.

---

## 3. What Stratos Is

Stratos is a two-surface product backed by one shared AI pipeline.

**Surface 1 — The Tactical Decision Timeline.** A horizontal, interactive timeline (built with D3.js) plotted across match minutes 0–90+. Key events — goals, cards, substitutions, tactical/formation shifts — appear as clickable nodes. Clicking a node asks the AI backend to explain *why* that moment happened: what the score and pressure situation was, what the tactical logic behind a substitution was, why a press was triggered. This is the "explain the moment" surface.

**Surface 2 — The Adaptive Multilingual Chat Companion.** A conversational interface where a fan selects their team, their football knowledge level (Beginner / Casual / Tactical), and their preferred language during onboarding. From that point forward, every answer — whether about a rule, a live score, or a tactical question — is generated at the right depth and in the right language automatically. This is the "explain it to me, the way I understand it" surface.

Both surfaces share the same retrieval layer (IFAB Laws of the Game + team profiles in ChromaDB, ingested via Docling), the same orchestration layer (Langflow, federating tools through Context Forge), and the same generation engine (IBM Granite). The user never has to choose between "the rules tool" and "the chat tool" — Stratos is one coherent product with two front doors into the same intelligence.

---

## 4. Origin: How TactiLens + FanLens Merged Into Stratos

Early brainstorming produced five separate concepts mapped to the four official challenge solution areas. Two of them were strong enough to pursue, and rather than picking one, they were merged into a single unified project:

**TactiLens** (originally scoped under *Understanding & Explanation*) was a standalone idea: ingest match event data, build a tactical decision timeline, and use Granite to narrate why a coach made a given decision at a given moment. Its strength was the visual "wow" factor of an interactive timeline and its direct hit on the "tactical shift analysis" example solution area named in the official challenge brief.

**FanLens** (originally scoped under *Fan & Learning Experiences*) was a separate standalone idea: an onboarding-driven, knowledge-tiered, multilingual chat companion that answers "why was that offside?" differently depending on whether a new fan or a tactical fan asked it. Its strength was direct alignment with "personalized AI World Cup companions" and "multilingual tactical explainers," both explicitly named in the challenge brief, and the strongest "global accessibility" story of all the original five ideas.

**The merge decision:** rather than building two smaller, separately-scoped hackathon entries, the two were combined into Stratos because they share almost the entire backend. Both need: a grounded rules knowledge base (Docling + ChromaDB), a way to fetch live and historical match context (Football-Data.org + StatsBomb), an orchestration layer to route a query to the right data source (Langflow + Context Forge), and an LLM that adapts tone and depth to the requester (Granite). Building them as one project means one ingestion pipeline, one Granite client, one Langflow flow, and one Context Forge gateway serve two distinct user-facing experiences — and crucially, the submission now demonstrably addresses **two** of the four official challenge solution areas instead of one, which strengthens the Challenge Fit and Innovation judging criteria without duplicating engineering effort.

In short: **TactiLens became the Tactical Decision Timeline. FanLens became the Adaptive Chat Companion. Stratos is the product name for both, sharing one engine.**

---

## 5. Challenge Alignment

| Requirement | How Stratos Satisfies It | Status |
|---|---|---|
| AI as a core, meaningful component | Every output (rule explanation, tactical narrative, chat response) is generated by IBM Granite grounded in retrieved context — not templated text | **Complete** |
| At least one required IBM tool | Uses all five: Granite, Docling, Langflow, Context Forge, IBM Bob | **Complete** |
| Not a pure prediction engine | Stratos explains; it never forecasts outcomes | **Complete** |
| Not opaque AI | Every chat response cites which Law or data source it drew from | **Complete** |
| Solution area: Understanding & Explanation | Tactical Decision Timeline | **Complete** |
| Solution area: Fan & Learning Experiences | Adaptive multilingual chat companion | **Complete** |
| Public GitHub repo + README | Fully customized and polished | **Complete** |
| Functioning prototype | Operational end-to-end (local dev server + FastAPI API) | **Complete** |
| Demo video ≤ 3 minutes | Scripted and ready | **Complete** |

---

## 6. System Architecture

The implemented backend consists of a unified API surface serving two interactive surfaces, backed by a resilient IBM Granite and Context Forge MCP orchestration pipeline:

```
                         ┌────────────────────────┐
                         │   Vite React Frontend  │
                         │   Onboarding & Console │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────▼─────────────┐
                         │     FastAPI Backend       │
                         │   (localhost:8000/chat)  │
                         │   (SQLite Auth/Profile)  │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────▼─────────────┐
                         │    WatsonX AI RAG Client  │
                         │  (Granite-4-H-Small API) │
                         └──────┬─────────────┬──────┘
                                │             │
                   ┌─────────────▼───┐   ┌─────▼──────────────┐
                   │  Context Forge   │   │     ChromaDB       │
                   │  MCP SSE Gateway │   │ (Ingested: Laws of │
                   │  (port 4444)     │   │  Game & Profiles)  │
                   └────────┬─────────┘   └────────────────────┘
                            │
                   ┌────────▼─────────┐
                   │  mcp_server.py    │
                   │  (FastMCP, 8012) │
                   └─┬───────┬────────┘
                     │       │
             ┌───────▼─┐ ┌───▼────┐
             │StatsBomb│ │Football-│
             │(Events) │ │Data API│
             └─────────┘ └────────┘
```

* **Backend Ingestion**: Completed. IFAB Laws of the Game 2025/26 (230-page PDF) and 48 team tactical profiles were ingested via Docling's `HybridChunker(max_tokens=512, merge_peers=True)` to respect heading boundaries, embedded, and stored locally in ChromaDB collections.
* **Unified API Surface**: Operational in [backend/main.py](file:///d:/Projects/ML/stratos/backend/main.py). Exposes `/chat` (with active history capping and dual vector database retrieval), `/match/current` (live score/fixture querying), and `/timeline/{match_id}` (StatsBomb events).
* **Generation Engine**: Wired. Integrates `ibm/granite-4-h-small` in `us-south` via WatsonX, supporting three personas (Beginner, Casual, Tactical) with customized retry backing and dynamic multilingual instruction injection.

---

## 7. Backend Implementation Details

* **Local DB Collections**: Set up in [backend/core/db.py](file:///d:/Projects/ML/stratos/backend/core/db.py). Loads persistent collections for `fifa_laws` and `team_profiles` into a local SQLite-backed Chroma store.
* **WatsonX Granite Wrapper**: Completed in [backend/core/watsonx_client.py](file:///d:/Projects/ML/stratos/backend/core/watsonx_client.py). Generates replies using WatsonX SDK parameters, managing greedy decoding and repetition penalties, with automatic fallback mapping if the primary endpoint encounters API quotas.
* **FastMCP Server**: Running at [mcp_server.py](file:///d:/Projects/ML/stratos/mcp_server.py). Contains tools for Laws query, team profile lookup, StatsBomb JSON retrieval, and Football-Data context mapping.
* **Database-Backed Auth**: SQLite engine `users.db` persists accounts with hashed passwords using `bcrypt` and issues secure JWT tokens via `PyJWT` for route guards.

---

## 8. Implemented Frontend UI/UX Architecture

The frontend is a fully responsive React application powered by Vite, TS, and Tailwind CSS. The design system follows a **F1 Broadcast Telemetry** visual theme:

### A. The Landing Page
A premium landing page introducing Stratos with advanced scroll interaction:
* **Sticky Soccer Ball**: The 3D canvas is locked on screen and explodes outward as the user scrolls, fading out completely by `60vh`.
* **Scroll-Linked Reveals**: Sections fade and slide into view in direct synchronization with scroll progress, eliminating visual lag.
* **Onboarding & Auth modal**: Desaturated forms for Sign-Up / Login preceding calibrator settings.

### B. The Dashboard Console
* **Scoreboard Header**: Dynamic match telemetry cards indicating goals, stages, and date context.
* **Interactive Heatmaps**: Attacking telemetry grids highlighting field tilt and tactical loads.
* **RAG Companion Chat**: Smooth typing indicator waves (`animate-dot-flow`) and citation cards.

---

## 9. Project State & Task Verification

### Completed Backend
* [x] Persistent ChromaDB collection populated with IFAB laws and 48 team tactical profiles.
* [x] FastAPI server exposing `/chat`, `/match/current`, and `/timeline/{match_id}` with full CORS.
* [x] SQLite database integration for registering and authenticating accounts securely.
* [x] WatsonX client wrapper integrating `ibm/granite-4-h-small` with backoff and retry handling.
* [x] FastMCP server wrapping database lookups and external APIs.
* [x] Unified starting script (`scripts/start_all_backend.py`) for co-running all servers.

### Completed Frontend
* [x] Scaffold Vite + React + TS project inside the `frontend/` folder.
* [x] Implement theme variables and CSS utility scales in `styles.css`.
* [x] Implement sticky Soccer Ball 3D particle canvas with scroll burst range.
* [x] Refactor content reveal system to be scroll-linked.
* [x] Build onboarding auth gateway (Auth -> Team -> Fluency -> Language).
* [x] Build D3-backed timeline tracking match event logs.
* [x] Build Chat companion with loading waves and source citation support.
