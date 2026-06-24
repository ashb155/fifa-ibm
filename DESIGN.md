---
name: Stratos
description: Matchday-grade tactical reasoning console
colors:
  primary: "#e10600"
  neutral-bg: "#000000"
  neutral-fg: "#f5f5f7"
  obsidian: "#121316"
  carbon: "#08090a"
  platinum: "#94a3b8"
  team-bra: "#fde047"
  team-bra-glow: "#fde04722"
  team-arg: "#7dd3fc"
  team-arg-glow: "#7dd3fc22"
  status-error: "#ef4444"
  status-error-dark: "#dc2626"
  status-success: "#16a34a"
  status-blue: "#3b82f6"
  status-blue-dark: "#1d4ed8"
  status-warning: "#fb923c"
  surface-slate: "#0f172a"
  white: "#ffffff"
  gray-alternate: "#86868b"
  border-overlay: "rgba(255,255,255,0.08)"
typography:
  display:
    fontFamily: "Outfit, Inter, sans-serif"
    fontWeight: 600
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontWeight: 400
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "28px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
---

# Design System: Stratos

## 1. Overview

**Creative North Star: "F1 Broadcast Telemetry"**

Stratos is designed to feel like an analytical, high-octane F1 broadcast panel or tactical command console rather than a generic sports score aggregator. It utilizes deep blacks, high-contrast cool typography, and a single dramatic F1 red accent to create an authoritative, desaturated cockpit experience.

### Key Characteristics:
- Cinematic Pitch-Black Canvas
- Precise, Technical Typography
- Borrowed Light Personalization
- Strict Spacing Rhythm

## 2. Colors

The color palette is anchored in absolute pitch black with neutral cool grays, punctuated by a single saturated F1 speedway red.

### Primary
- **F1 Speedway Red** (#e10600): The single accent color for primary actions, focus highlights, and active telemetry. Used sparingly (under 10% density) to maintain high impact.

### Neutral
- **Pitch Black** (#000000): The main page background.
- **Carbon** (#08090a): Background for primary layout bands and sections.
- **Obsidian** (#121316): Background for elevated cards and modules.
- **Floodlight** (#f5f5f7): High-contrast primary text color.
- **Platinum** (#94a3b8): Cool gray for secondary labels, descriptions, and metadata.

### Named Rules
**The 10% Density Rule.** The primary F1 red accent is used on ≤10% of any given screen. Its rarity is what gives it visual speed and impact.

## 3. Typography

**Display Font:** Outfit (fallback Inter, sans-serif)
**Body Font:** Inter (fallback sans-serif)
**Label/Mono Font:** JetBrains Mono (fallback monospace)

### Hierarchy
- **Display** (600, clamp(2.5rem, 5vw, 4rem), 0.95): Hero headings, scoreboard scores, main titles.
- **Headline** (600, 24px, 1.1): Panel header categories.
- **Body** (400, 15px, 1.55): Chat responses, match descriptions, tactical details.
- **Label / Mono** (400, 11px, 0.22em letter-spacing, uppercase): Section eyebrows, timeline timestamps, data source citations.

## 4. Elevation

The system is flat by default, relying on tonal layering (Black -> Carbon -> Obsidian) instead of heavy shadows to build depth.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Subtle glows or outline strokes in the primary color or dynamic team color appear only as a response to active focus or hover states.

## 5. Components

### Buttons
- **Shape:** Pill-shaped (999px) or lightly rounded (8px).
- **Primary:** Background F1 Red (#e10600), text white, hover with subtle translation lift.
- **Secondary:** Border outline in border gray (rgba(255,255,255,0.08)), transparent background, text platinum.

### Cards / Containers
- **Corner Style:** Large radii (28px) for major layout sheets, medium radii (16px) for embedded modules.
- **Background:** Carbon (#08090a) or Obsidian (#121316).
- **Border:** Hairline border (1px, rgba(255, 255, 255, 0.08)).

### Inputs
- **Style:** Background white/5 (rgba(255, 255, 255, 0.05)), rounded pill, no border.
- **Focus:** Background white/10, outline stroke in F1 Red.

## 6. Do's and Don'ts

### Do:
- **Do** stick to a desaturated neutral theme, allowing team colors to act only as outline glows.
- **Do** respect the 10% density rule for red highlights.
- **Do** ensure text on dark backgrounds maintains a contrast ratio of at least 4.5:1.

### Don't:
- **Don't** use decorative gradients or warm cream/beige backgrounds.
- **Don't** use glassmorphic blur effects on basic layout elements unless specifically for modal overlays.
- **Don't** add side-stripe accent borders to cards.
