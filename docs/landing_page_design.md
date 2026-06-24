# Stratos Landing Page: Cosmic Showroom — Design Specification
> Blending Apple's cinematic product stages with Dala's cosmic violet-on-void particle fields

This document defines the landing page for Stratos, merging the **Apple España** and **Dala** design philosophies. The resulting layout uses a three-act structure that transitions from a dark cosmic hero screen to deep tactical feature stages, and finally into a high-contrast paper-white detail band.

---

## 1. Merged Token System

To create a cohesive landing page, we combine specific visual assets from both reference guides:

| Token Category | Value / Source | Role |
| :--- | :--- | :--- |
| **Hero & Base Canvas** | `#000000` (Dala Void / Apple Pure Black) | Infinite backdrop allowing assets to float |
| **Card Surfaces** | `#1d1d1f` (Apple Obsidian) / `#111111` (Carbon) | Elevated surfaces on dark sections; no drop shadows |
| **Primary Accent** | `#8052ff` (Dala Plum Voltage) | The single saturated CTA button color and glowing lines |
| **Category Eyebrows** | `#f56900` (Apple Signal Orange) | Plain uppercase text labels signaling sections |
| **Display Typography** | Space Grotesk / Inter | Weight 200, large scale (80px), negative letter-spacing (`-0.04em`) |
| **Body Typography** | Inter (Weights: 400, 600) | Opens up at body sizes for legible reading |
| **Corner Geometry** | 28px card radius, 24px/36px pills | Soft buttons and cards contrasting with a flat screen |

---

## 2. Landing Page Act Structure

```
┌────────────────────────────────────────────────────────┐
│  DALA Logo          manifesto  team  blog  [LAUNCH]    │  Act 1: Sticky Pill Nav
├────────────────────────────────────────────────────────┤
│                                                        │
│                                                        │
│   STOP WATCHING FOOTBALL. START UNDERSTANDING IT.      │  Act 1: Cosmic Hero Stage
│   El fútbol,                                           │  - Weight 200 Display (80px)
│   entendido.                                           │  - Floating Particle Field
│   [LAUNCH COMPANION]   IBM Hackathon Entry             │  - Floating UI Mockup
│                                                        │
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │  Act 2: Dark Feature Stages
│  │ TactiLens: Click a shift, understand the press.  │  │  - Obsidian Card (#1d1d1f)
│  │  0'──●────────●───────●───90'                    │  │  - 28px Corners
│  └──────────────────────────────────────────────────┘  │  - Violet Accent Highlights
├────────────────────────────────────────────────────────┤
│                                                        │
│  IBM Granite & Docling                                 │  Act 3: Paper White Band
│  Translating complexity into natural language.         │  - High contrast (#ffffff)
│                                                        │  - SVGL Outlined Logo Icons
└────────────────────────────────────────────────────────┘
```

### Act 1: The Cosmic Hero Stage (Pure Black & Violet Accent)
* **Background**: Pure Black (`#000000`) with Dala's floating particle canvas. 1,200 micro-particles (circles, triangles, diamonds) drift in slow orbital patterns. The particles cluster gently around the mouse position, creating a living visual space.
* **Layout**: A 50/50 split. 
  * *Left half*: A tight text block containing:
    * **Eyebrow**: `STOP WATCHING FOOTBALL. START UNDERSTANDING IT.` in Space Grotesk 14px weight 600, uppercase, track `+0.05em`, color Bone (`#ffffff`).
    * **Headline**: `El fútbol, entendido.` in Space Grotesk weight 200 at 80px scale, with aggressive negative tracking (`-0.04em`), line-height 0.85. The text reads like an "etched light" sculpture.
    * **Description**: A body paragraph in Ash (`#bdbdbd`) explaining the tactical explainability of Stratos.
    * **CTAs**: A single Plum Voltage (`#8052ff`) filled pill CTA button (`LAUNCH COMPANION`) beside a ghost price label: `IBM Hackathon Entry · Free Access`.
  * *Right half*: A floating interactive mockup of the Stratos Tactical Dashboard. The mockup has no card frame; the browser elements float directly on the particle field with a soft violet glow.

### Act 2: The Tactical Feature Stages (Obsidian Cards & Violet Outlines)
* **Background**: Pure Black. Vertical stack of two large features with a `120px` section gap.
* **Feature Card 1 — TactiLens Timeline**: A full-bleed Obsidian (`#1d1d1f`) card with 28px rounded corners. Inside is a B&W drone shot of a football pitch with a glowing Plum Voltage line representing the tactical timeline track. Clicking nodes on the timeline plays a micro-animation that expands info bubbles in place.
* **Feature Card 2 — FanLens Companion**: Two columns. Left column showcases the chat interface. A RAG citation tag `LAW 11 · OFFSIDE` sits in transparent outlines above an explanation rail (styled with a 3px solid Plum Voltage left border). Right column has an orange category eyebrow tag `TACTICAL DEPTH` followed by a 56px headline: "Explainability at every level."

### Act 3: The Detail Band (Paper White & High Contrast)
* **Background**: Paper White (`#ffffff`), shifting the page rhythm dynamically.
* **Layout**: Two columns with generous padding (160px).
* **Left Column**: Orange eyebrow `THE STACK`, followed by a 56px SF Pro Display headline in Obsidian (`#1d1d1f`): "Powered by IBM Granite." The body text is set in Platinum (`#86868b`) at 17px.
* **Right Column**: An integration map using high-quality outlined vector badges (based on `svgl` logo styles) representing IBM Granite (WatsonX), Docling, Langflow, Context Forge, and StatsBomb.

---

## 3. Top Navigation Bar (Pill Shape)

Positioned as a fixed top bar centered in the page. 
* **Style**: Pure Black (`#000000`) background, 980px pill radius, 10px vertical padding. Semi-transparent on scroll with a `backdrop-filter: blur(20px)`.
* **Content**: 
  * *Left*: Dala-style crystal/envelope mark, followed by "STRATOS" wordmark in weight 600 Space Grotesk.
  * *Center*: Links (`TactiLens`, `FanLens`, `Integrations`) in Smoke (`#9a9a9a`) changing to Bone (`#ffffff`) on hover.
  * *Right*: Ghost Nav Button `LAUNCH COMPANION` in Plum Voltage fill, 24px border radius.
