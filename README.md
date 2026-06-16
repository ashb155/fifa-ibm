# Stratos — Football, Understood.
**An IBM AI Builders Challenge Submission (June: AI Inside the Match)**

## The Problem We Are Solving
The World Cup generates a shared emotion for billions of fans watching game-changing moments unfold in real time. However, the global audience experiences the match with vastly different levels of tactical knowledge and language fluency. While casual fans may not understand why a coach pulled a midfielder to shift into a 5-4-1, or why a specific offside rule was enforced, current digital solutions lack the ability to adapt to these different user profiles. Fans need an adaptive companion that bridges the gap between raw match data, complex regulatory rules, and personal comprehension.

## Your AI/Technical Approach
Stratos is an adaptive, multilingual match companion that unites spatial match data with deep regulatory knowledge. To build this unified solution, we leveraged the complete suite of required IBM AI-supported technologies:

*   **IBM Docling:** Used to parse the unstructured, multi-column IFAB Laws of the Game PDF into semantic chunks while perfectly preserving its layout and tabular guidelines.
*   **ContextForge:** Acts as our Model Context Protocol (MCP) gateway. It securely federates our real-time match data API (Football-Data.org / StatsBomb) and our local ChromaDB rules vector store into standardized tools. This prevents context bloat and enforces rate limits.
*   **Langflow:** Serves as our visual RAG orchestration engine. It manages a dynamic prompt template that injects the user's language (e.g., English, Portuguese, German) and knowledge tier (New, Casual, Tactical) to route tool calls appropriately.
*   **IBM Granite:** We utilize `granite-3-3-8b-instruct` as our core foundation model to reason over the retrieved spatial coordinates and rules, generating highly accurate, localized, and jargon-appropriate explanations.
*   **IBM Bob:** Used throughout our Software Development Lifecycle (SDLC) as an AI development partner to initialize our repository, generate the Python ingestion scripts for Docling, and perform automated code reviews before deployment.

## Why Your Solution Matters in the Context of the Challenge
Stratos directly answers the challenge's call to demonstrate how "human-centered, explainable AI can improve understanding, trust, and accessibility at global scale." 

By addressing both the **Understanding & Explanation** (tactical shift analysis) and **Fan & Learning Experiences** (multilingual "teach me the game" assistant) tracks, Stratos proves that AI can democratize sports analytics. A fan in Brazil, a tactical analyst in Germany, and a new viewer in India can all watch the exact same match, ask natural language questions, and receive an AI-powered explanation tailored precisely to their language and soccer knowledge level.