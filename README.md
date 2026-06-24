# 🚀 Stratos: Football, Understood

An AI-powered match companion built for the IBM **"AI Inside the Match"** Hackathon. 

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![IBM WatsonX](https://img.shields.io/badge/IBM_WatsonX-Granite_4_H-purple.svg)](https://www.ibm.com/products/watsonx-ai)
[![Docling](https://img.shields.io/badge/Docling-v2.0-blue.svg)](https://github.com/DS4SD/docling)

---

## 📸 Demo Preview

Stratos features a cinematic dark **F1 Broadcast Telemetry** visual interface with scroll-linked interactions:

![Stratos Landing Console Mockup](docs/lab_result_1.png) *(Streamlit Predictor Scaffolding)*

---

## ⚽ The Problem & Overview

During major football tournaments like the World Cup, millions of fans watch the same 90 minutes but experience them in completely different ways. 
- A **Beginner fan** sees an offside flag and has no idea *why* it was called.
- A **Casual fan** watches a mid-game formation change and doesn't register that anything changed.
- A **Tactical analyst** watches the same moment but gets frustrated because the broadcast commentator never explains the underlying coaching logic.

Most current sports apps report **what** happened, but they never explain **why**, and they never adapt to **who is asking**.

**Stratos** bridges this comprehension gap. It provides a two-surface match intelligence dashboard powered by one shared IBM Granite RAG pipeline. It meets every fan at their level of football fluency, in their language, grounded in real StatsBomb event streams and the official IFAB Laws of the Game.

---

## ✨ Features

- **🌎 Dynamic Multilingual RAG**: Answers queries dynamically in 10 different languages (English, Spanish, Portuguese, German, etc.) and adjusts explanation depth according to 3 fluency tiers (Beginner, Casual, Tactical).
- **📊 Interactive Decision Timeline**: Plotted across match minutes. Clicking any card, goal, or formation shift queries the RAG engine to explain the tactical reasoning.
- **⚡ Sticky Soccer Ball Scroll-Burst**: A 3D particle canvas locked in the viewport that splits apart and shatters in direct synchronization with scroll progress.
- **📜 Scroll-Linked Content Reveals**: Sections slide and fade up smoothly based on scroll coordinates rather than timer-delayed animations.
- **🔒 SQLite & JWT Secured Authentication**: Features registration gates, secure password hashing (`bcrypt`), and token guards (`PyJWT`) protecting dashboard access.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Vite + React + TypeScript + TanStack Router
- **Styling**: Tailwind CSS + custom CSS layers
- **Motion**: Framer Motion (scroll-driven transforms)
- **Data Viz**: D3.js + custom SVGs

### Backend
- **Server**: FastAPI (Python 3.11)
- **Database**: SQLite (Auth credentials & Profile configs)
- **Vector Search**: ChromaDB (IFAB Laws of the Game & Team Profiles)
- **Orchestration**: Langflow + Context Forge (MCP SSE Gateway)
- **Parser**: Docling (HybridChunker sectioning)
- **Generation**: IBM WatsonX.ai (`ibm/granite-4-h-small`)

---

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- Python (3.11+)
- IBM WatsonX account & API key

### 1. Set Up Environment Variables
Create a `.env` file in the root project directory:
```bash
WATSONX_API_KEY=your_ibm_watsonx_api_key
WATSONX_PROJECT_ID=your_ibm_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### 2. Set Up the Python Backend
Run the backend installation commands:
```bash
# Clone the repository
git clone https://github.com/AneeshVRao/stratos-fan-lens.git
cd stratos-fan-lens

# Create virtual environment and install dependencies
python -m venv .venv
source .venv/bin/activate  # Or `.venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

### 3. Set Up the React Frontend
Run the client installation commands:
```bash
cd frontend
npm install
```

---

## 🚀 Usage

### 1. Run the Backend Stack
Launch FastAPI, ChromaDB, Context Forge, and the FastMCP server concurrently using the starting utility script:
```bash
# From the root directory
python scripts/start_all_backend.py
```

### 2. Run the Vite Client
Start the local development server:
```bash
# From the frontend directory
npm run dev
```
Open `http://localhost:8080` in your browser to interact with the console.

---

## 🎨 Impeccable Design Heuristics

Stratos has been audited for strict design compliance using the `impeccable` CLI detector.
- **Color Discipline**: Accent colors (F1 Red `#e10600`) respect the **10% density rule**, while team personalization colors appear only as dynamic outlines ("borrowed light") to reduce cognitive noise.
- **Smooth Easing**: Tacky bounce timings were replaced with linear-to-spring transitions and smooth wave scaling.
- **Typography Alignment**: Font imports are declared in [DESIGN.md](DESIGN.md) and mapped cleanly using Space Grotesk (display headings), Inter (reading text), and JetBrains Mono (citations/eyebrows).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙌 Credits & Acknowledgments

- **IBM AI Builders Challenge** for the challenge brief and WatsonX compute.
- **StatsBomb** for open-access football event data telemetry.
- Inspired by F1 broadcast commentary setups.