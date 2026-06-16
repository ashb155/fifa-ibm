# Product Requirements Document (PRD): Stratos - Football, Understood

## 1. Overview and Problem Statement

**Stratos** is a hackathon project built for the "AI Inside the Match" theme. It addresses two primary tracks: "Understanding & Explanation" and "Fan & Learning Experiences". 

Football is a universal language, but the dense, jargon-filled tactical decisions and rulebooks often create barriers for new or casual fans. Stratos bridges this gap by acting as an **Adaptive Multilingual Companion** and a **Tactical Decision Explainer**. By translating complex football events into accessible, jargon-free explanations in multiple languages, Stratos makes the beautiful game universally understandable.

## 2. Technical Stack and Architecture

The solution utilizes a suite of IBM technologies to ensure a robust, production-grade application:
- **IBM Docling**: For document parsing and ingestion (FIFA Laws, regulations).
- **IBM Granite**: The core LLM for multilingual generation and reasoning.
- **Context Forge**: Centralized tool registry and API gateway for secure access.
- **Langflow**: Visual orchestration pipeline for routing logic and agents.
- **React/TypeScript & Zustand**: For frontend state management and interaction.
- **D3.js**: To render the interactive tactical timeline.
- **ChromaDB**: For vector search and RAG capabilities.

## 3. Implementation Plan

### Phase 1: Solidify the Data & Knowledge Backend
Formalize data pipelines to replace prototype scripts.
- **Formalize Docling Ingestion:** Implement an automated parsing script using IBM Docling (`DoclingLoader` with `ExportType.DOC_CHUNKS` or `HierarchicalChunker`). Ingest the FIFA Laws of the Game PDF, team profiles, and tournament regulations into semantic chunks. Store in ChromaDB with metadata filtering (source, law number, team) to prevent hallucination.
- **Complete the MCP Server (`mcp_server.py`):**
  - **Tactical Engine:** Finalize `get_tactical_timeline()`. Use `statsbombpy` to fetch match events, filtering for `Tactical Shift` (ID: 36) and `Substitution` (ID: 19).
  - **Live Data Engine (Recommended):** Integrate Football-Data.org API to pull real-time context (scorelines, active rosters) to inform live query responses.

### Phase 2: Deploy the ContextForge Gateway
Securely expose MCP tools to the orchestration layer.
- **Configure Gateway:** Create `mcp_settings.json` registering the local Python MCP server.
- **Run ContextForge:** Run the gateway locally (via Docker or Python CLI) to expose StatsBomb and ChromaDB tools through a secure, rate-limited endpoint.

### Phase 3: Build the Langflow Orchestration Pipeline
Orchestrate interactions, models, and tools.
- **Set up Flow:** Use Langflow's Chat Input component to capture user query, language preference, and knowledge level (New/Casual/Tactical).
- **Connect ContextForge:** Add the MCP Tools component connected to the ContextForge server URL.
- **Dynamic Prompting:** Create a Prompt Template component injecting metadata (e.g., "Explain this at a {knowledge_level} level in {language}") alongside the retrieved context.
- **Integrate IBM Granite:** Connect an IBM watsonx.ai or local Ollama component using Granite 3.1 8B Instruct or Granite 4.1 8B for multilingual and reasoning tasks.

### Phase 4: Frontend UI & Interactive Timeline
Build the user-facing application for the "Tactical Decision Explainer".
- **State Management:** Build a React/TypeScript frontend. Use Zustand to persist onboarding preferences (Team, Language, Knowledge Tier).
- **D3.js Tactical Timeline:** Implement an interactive SVG timeline mapping StatsBomb events on a linear x-axis (0-90+ minutes).
- **Interactive Explanations:** On timeline node click (e.g., "74th min, shifted to 5-4-1"), trigger an API call to the Langflow endpoint to generate and display localized, complexity-adjusted narratives of the coach's decision.

### Phase 5: Polish & Hackathon Deliverables
Ensure maximum impact for the judging criteria.
- **The README (`README.md`):** Expand documentation to clearly state the problem, technical approach, and global accessibility impact. Emphasize how bypassing jargon aids the fan experience.
- **Demo Video (Max 3 Min):** Record a walkthrough showing the onboarding flow, clicking the timeline, and the Granite model generating adaptive explanations.
- **Code Cleanup:** Track `mcp_server.py` in Git, add a `requirements.txt`, and document local environment setup for Langflow and ContextForge.

## 4. Immediate Next Steps
- Commit `mcp_server.py` to the repository.
- Successfully connect `mcp_server.py` to a basic Langflow canvas to validate Granite's execution of StatsBomb and ChromaDB tools.
