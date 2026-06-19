# Stratos: Football, Understood
### Product Requirements & Implementation Document
**IBM AI Builders Challenge — June 2026 Innovation Challenge**
**Authors:** Aneesh Venkatesha Rao & Ashutosh Bhat
**Deadline:** June 30, 2026, 11:59 PM ET
**Document Date:** June 18, 2026 (12 days remaining)

---

## 1. Executive Summary

Stratos is an AI-powered football companion built for the IBM AI Builders Challenge "AI Inside the Match" theme. It solves a single problem from two angles at once: billions of people watch the same football match and understand almost none of it the same way. A casual fan in Brazil doesn't know what offside means. A tactical fan in Germany wants to know why the coach made a substitution in the 74th minute. Stratos answers both, in the fan's own language, at the fan's own level of football fluency, grounded in real match data and the actual Laws of the Game — not generic LLM guesswork.

It is built entirely on IBM's required technology stack — Granite, Docling, Langflow, Context Forge, and (where access allows) IBM Bob — and is designed to score well against all four official judging criteria: Technical Execution, Innovation, Challenge Fit, and Implementation & Feasibility.

---

## 2. Problem Statement

During the World Cup, the same 90 minutes are experienced as completely different events depending on who is watching. A new fan sees a player flagged offside and has no idea why. A casual fan sees a coach change a formation and doesn't register that anything happened at all. A tactical fan watching the same moment is frustrated that broadcast commentary never explains the actual tactical logic. None of these fans speak the same football vocabulary, and most platforms — score trackers, fantasy apps, static dashboards — don't address comprehension at all. They report *what* happened. They never explain *why*, and they never adapt to *who is asking*.

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

| Requirement | How Stratos Satisfies It |
|---|---|
| AI as a core, meaningful component | Every output (rule explanation, tactical narrative, chat response) is generated by IBM Granite grounded in retrieved context — not templated text |
| At least one required IBM tool | Uses all five: Granite, Docling, Langflow, Context Forge, IBM Bob |
| Not a pure prediction engine | Stratos explains; it never forecasts outcomes |
| Not a static dashboard | All data is synthesized into natural-language explanation, not raw tables |
| Not opaque AI | Every chat response cites which Law or data source it drew from |
| Solution area: Understanding & Explanation | Tactical Decision Timeline |
| Solution area: Fan & Learning Experiences | Adaptive multilingual chat companion |
| Public GitHub repo + README | In progress (see Section 10) |
| Functioning prototype | In progress |
| Demo video ≤ 3 minutes | Scripted, not yet recorded |

---

## 6. System Architecture

Two pipelines, one shared backend:

```
                         ┌────────────────────────┐
                         │     React Frontend      │
                         │  Onboarding / Chat / D3  │
                         │       Timeline           │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────▼─────────────┐
                         │     FastAPI Backend       │
                         │ /session  /chat  /match   │
                         │       /timeline           │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────▼─────────────┐
                         │     Langflow Pipeline      │
                         │ Router → Prompt → Granite  │
                         └──────┬─────────────┬──────┘
                                │             │
                  ┌─────────────▼───┐   ┌─────▼──────────────┐
                  │  Context Forge   │   │   IBM Granite       │
                  │  MCP Gateway     │   │  (WatsonX.ai)        │
                  │  (port 4444)     │   │  Adaptive generation  │
                  └────────┬─────────┘   └──────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │  mcp_server.py    │
                  │  (FastMCP, 6 tools)│
                  └─┬───────┬────────┬┘
                    │       │        │
            ┌───────▼─┐ ┌───▼────┐ ┌▼─────────────┐
            │ChromaDB │ │StatsBomb│ │Football-Data.org│
            │(Docling-│ │(historical│ │ (live match)   │
            │ ingested)│ │ events)  │ │                │
            └─────────┘ └─────────┘ └────────────────┘
```

**Offline / one-time ingestion path:** IFAB Laws of the Game PDF → Docling (HybridChunker) → embeddings → ChromaDB. Team profile text files → same path → separate ChromaDB collection. This runs once via `scripts/ingest.py`, not on every request.

**Online / per-query path:** User query (chat message or timeline click) → FastAPI → Langflow → router decides if the query needs rules (ChromaDB via MCP), live context (Football-Data.org via MCP), or historical tactical events (StatsBomb via MCP) → Context Forge proxies the call to `mcp_server.py` → result returned to Langflow → assembled into a Granite prompt with the user's knowledge level and language → Granite generates the final response → returned to the user.

---

## 7. IBM Technology Integration — Exactly How Each Tool Is Used

**IBM Granite (`ibm/granite-3-8b-instruct` via WatsonX.ai)** is the generation engine for every user-facing response. It receives retrieved context (rule text, match data, tactical events), the user's knowledge level, and language, and produces the final natural-language answer. Three distinct system prompts control output: Beginner (zero jargon, analogy-driven, under 90 words, ends with a follow-up question), Casual (conversational, brief term definitions, under 150 words), and Tactical (full football terminology, xG/pressing/formation depth, under 200 words). All three support multilingual output (Spanish, Portuguese, French, German, Arabic, Hindi confirmed reliable).

**Docling** parses the IFAB Laws of the Game PDF (and team profile documents) into clean structured markdown that preserves heading hierarchy — critical because a "Law 11 – Offside" heading must stay intact as one retrievable unit rather than being split mid-sentence by naive character-count chunking. `HybridChunker(max_tokens=512, merge_peers=True)` is used specifically because it bounds chunk size while still respecting document structure, which is the chunker swap currently being applied to replace the initial `HierarchicalChunker` pass.

**Langflow** is the visual orchestration layer. It receives the user's query plus metadata, routes it to the correct tool (rules lookup vs. live match vs. tactical event history) via a conditional router node, assembles the final prompt via a PromptTemplate node, and calls Granite via a WatsonX node. The completed flow is exported as `stratos_flow.json` and committed to the repo so judges can inspect the orchestration logic directly, not just trust a description of it.

**Context Forge** is the MCP gateway sitting between Langflow and the custom tool server. Rather than Langflow connecting directly to `mcp_server.py`, the FastMCP-based tool server is registered with Context Forge as a backend server (via a REST call to its `/servers` endpoint), and Context Forge exposes a single unified gateway endpoint that Langflow's MCP Client node connects to. This is the architecturally "advanced" pattern in the stack — it demonstrates a production-style separation between tool implementation and tool discovery/federation, rather than a hardcoded integration.

**IBM Bob** is intended as the AI coding assistant used during scaffolding (FastAPI boilerplate, MCP tool function structure, React component scaffolding). As of this document, trial activation is blocked by a platform-side account error. This is being escalated via Discord and email; if unresolved, the README will document the blocker with a screenshot rather than silently omitting the tool.

---

## 8. Data Sources

| Source | Purpose | Notes |
|---|---|---|
| IFAB Laws of the Game 2025/26 (PDF) | Rules knowledge base | Ingested via Docling once, stored in ChromaDB |
| Team tactical profiles (auto-generated `.md` files, 48 teams) | Team-specific context for tactical answers | One file per team, separate ChromaDB collection, synced with live API |
| Football-Data.org REST API | Live match score, minute, recent events | Free tier, 10 req/min, cached 60s |
| StatsBomb open data (`statsbombpy`) | Historical tactical events (substitutions, tactical shifts, shots) for the timeline | Confirmed: `competition_id=43, season_id=106` = 2022 World Cup. Live 2026 data not expected to be available in open data yet — demo uses a confirmed historical match |

---

## 9. User Experience / Product Flows

**Onboarding (one-time per session):** Step 1 — pick a team from a searchable grid of all World Cup teams. Step 2 — pick a knowledge level (Beginner / Casual / Tactical), each with a one-sentence description of what that mode means. Step 3 — pick a language from a dropdown of eight supported languages. This calls `POST /session/create` and returns a `session_id` used for the rest of the session.

**Chat flow:** User types a question or clicks a suggestion chip. Message goes to `POST /chat` with the `session_id`. Backend retrieves session state (team, level, language, history), calls the Langflow pipeline, and returns Granite's response along with a "Source" tag showing which Law or data source was used. History is capped at the last 10 turns to control context size.

**Timeline flow:** User views the Tactical Decision Timeline for a selected match. Clicking an event node (e.g. "74' Substitution") sends that event's context to the chat as a pre-filled question ("Explain the tactical shift at minute 74"), which flows through the same chat pipeline above.

---

## 10. Current Repository State (as of June 18, 2026)

**Built and working:**
- `requirements.txt` with core dependencies (mcp, docling, chromadb, statsbombpy, etc.)
- `laws.md` — extracted IFAB Laws content
- `docling_ingest.py` — Docling-based IFAB Laws ingestion into ChromaDB (HybridChunker swap complete)
- `scripts/generate_real_profiles.py` & `scripts/fetch_and_update_squads.py` — Automates live squad sync of 48 teams
- `scripts/ingest_profiles.py` — Docling-based Team Profile ingestion into ChromaDB
- `chroma_db/` — populated persistent vector store with team profiles and IFAB laws
- `mcp_server.py` — FastMCP server exposing three tools (try/except resiliency wrapping complete)
- `mcp_settings.json` — Configuration for proper Context Forge registration
- `langflow_setup.md` & `stratos_flow.json` — The Langflow orchestration logic exported and documented
- `backend/main.py` — FastAPI server handling `/session/create`, `/chat`, `/match/current`, `/timeline/{match_id}`
- `backend/core/watsonx_client.py` — The IBM Granite adaptive wrapper with the three knowledge-level system prompts
- `tests/` — robust `pytest` suite validating endpoint behaviors and integrations
- `PRD.md`, `README.md` — Active documentation (Updated)

**In progress (this week):**
- Setup and run Context Forge as its own process (if not already fully integrated manually in UI)
- Build the final Frontend UI

**Not yet built at all:**
- React frontend (Onboarding, Chat Interface, D3.js Tactical Timeline)
- Demo video
- Final README sections (Problem / Technical Approach / Why It Matters, fully written)
- BeMyApp platform submission

---

## 11. Remaining Work — Full Task Breakdown

### Phase A — Backend Foundation Fixes (Completed)
- [x] Apply the approved try/except resiliency wrapping to `mcp_server.py`
- [x] Apply the `HybridChunker` swap in `docling_ingest.py` and re-run ingestion
- [x] Delete `laws.py`
- [x] Confirm the exact StatsBomb match_id via direct script lookup
- [x] Run `mcp_server.py` over HTTP/SSE (not stdio-only)
- [x] Install and start Context Forge as its own process
- [x] Register `mcp_server.py` with Context Forge via its REST API
- [x] Verify all three tools are visible through the Context Forge gateway endpoint before proceeding

### Phase B — Generation Layer (Completed)
- [x] Write `backend/core/granite.py`: WatsonX client initialization, the three system prompts (Beginner/Casual/Tactical), prompt assembly with retrieved context + match context + history, retry logic for API failures
- [x] Test standalone Granite calls for all three knowledge levels and at least three languages

### Phase C — Orchestration (Completed)
- [x] Build the actual Langflow flow in the visual UI: TextInput → MCP Client (pointed at Context Forge gateway, not the raw server) → conditional router → PromptTemplate → WatsonX/Granite node → TextOutput
- [x] Export and commit `stratos_flow.json`
- [x] Confirm FastAPI can call the flow via Langflow's REST API end-to-end

### Phase D — Backend API Surface (Completed)
- [x] `backend/main.py` with CORS for the Vite dev server
- [x] `POST /session/create`, `PATCH /session/{session_id}` — session state management
- [x] `POST /chat` — full pipeline call, history capping, source attribution in response
- [x] `GET /match/current` — cached live match data
- [x] `GET /timeline/{match_id}` — StatsBomb tactical events for the confirmed demo match

### Phase E — Frontend
- `Onboarding.jsx` — 3-step team/level/language flow
- `ChatInterface.jsx` — message thread, source display, loading state
- `MatchTimeline.jsx` — D3.js horizontal timeline, clickable event nodes, hover tooltips, click-to-chat integration

### Phase F — Data Integration & Testing (Completed)
- [x] Wire live Football-Data.org polling into the match sidebar
- [x] Wire confirmed StatsBomb match data into the timeline
- [x] Multilingual end-to-end testing across all three knowledge levels
- [x] Full error-path testing (API timeouts, empty retrieval results, missing match data)

### Phase G — IBM Bob (Completed)
- [x] Complete the required World Cup Predictor learning lab and use Bob for partial scaffolding
- [x] Results documented in `README.md` with screenshots

### Phase H — Submission Assets
- Record the 3-minute demo video (script already drafted: problem → onboarding → Beginner vs Tactical contrast → Langflow pipeline executing → Docling terminal output → D3 timeline interaction)
- Finalize `README.md` with all three required sections
- Submit project page on the BeMyApp platform with GitHub link, team details, and video link

---

## 12. Day-by-Day Build Plan (June 18 – June 30)

| Date | Focus |
|---|---|
| Jun 18 | Phase A: Context Forge fix, resiliency, chunker swap, match_id confirmation |
| Jun 19 | Phase B: `granite.py` built and tested across all knowledge levels |
| Jun 20 | Phase C: Langflow flow built in UI, exported, tested end-to-end |
| Jun 21–22 | Phase D: FastAPI backend, all four endpoints wired to Langflow |
| Jun 23–24 | Phase E: React Onboarding + Chat Interface |
| Jun 25 | Phase E: D3.js Tactical Timeline |
| Jun 26 | Phase F: Live + historical data wiring, multilingual testing |
| Jun 27 | Phase F/G: Error-path hardening, IBM Bob status resolution or documentation |
| Jun 28 | Phase H: Demo video recording |
| Jun 29 | Phase H: README finalization, full dry run of the entire stack |
| Jun 30 | Submit on BeMyApp before 11:59 PM ET |
