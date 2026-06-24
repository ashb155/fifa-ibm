# Stratos: Football, Understood — Style Reference
> Hawk-Eye lines on a midnight pitch — broadcast-grade explainability, one signature cyan, team color as borrowed light

**Theme:** dark

Stratos is a tactical-explainability companion rendered in the visual language of match-broadcast graphics rather than consumer sports apps: a smoky pitch-night canvas, a single Hawk-Eye cyan as the only system accent, and IBM Plex type doing all the structural work. The interface enforces a strict three-tier content grammar everywhere an answer appears — a citation tag for what the rules say, an explanation rail for what the AI is telling you, and a live data strip for what's happening right now — so explainability is built into the layout, not just claimed in copy. Card-event colors (yellow, red) are reserved exclusively for literal disciplinary events on the timeline, never decoration. The one personalization layer — each fan's selected team color — ignites only as borrowed light on bounded slots, the way a broadcast re-skins its graphics package per fixture, while system chrome stays neutral cyan-on-navy at all times.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Pitch Night | `#0a0f14` | `--color-pitch-night` | Primary canvas — a smoky navy-black, not pure black, evoking a drone shot of a stadium pitch at night |
| Floodlight | `#eef2f0` | `--color-floodlight` | Primary text on dark surfaces — a cool, slightly desaturated white |
| Touchline | `#6b7680` | `--color-touchline` | Secondary/muted text, hairline borders, resting nav state |
| Dugout | `#11161c` | `--color-dugout` | Elevated card surface, one step lighter than Pitch Night |
| Tunnel | `#05070a` | `--color-tunnel` | Deepest surface — modal backdrops, the Live Data Strip background |
| Hawk-Eye Cyan | `#2dd4ff` | `--color-hawkeye-cyan` | The single system accent — primary buttons, links, focus rings, active states |
| Card Yellow | `#ffd60a` | `--color-card-yellow` | Reserved exclusively for yellow-card events on the Tactical Timeline |
| Card Red | `#e8463c` | `--color-card-red` | Reserved exclusively for red-card events on the Tactical Timeline |
| Team Tint | dynamic | `--color-team-tint` | Set at runtime to the selected team's primary color, used only for outline/glow |

## Tokens — Typography

* Display: **IBM Plex Sans Condensed** (Weights: 600, 700)
* Sans: **IBM Plex Sans** (Weights: 400, 500)
* Mono: **IBM Plex Mono** (Weights: 400, 500)

## Components
* **Live Data Strip**: Full-width bar, background `#05070a`, 0px radius. Content in IBM Plex Mono.
* **Source Tag**: Outlined pill (999px radius), 1px Touchline border, transparent fill. Text in IBM Plex Mono 13px.
* **Explanation Rail**: Elevated card on Dugout (`#11161c`) with a 3px solid Hawk-Eye Cyan left border.
* **Knowledge Level Selector**: 3 cards, signal-bar glyphs (▁ / ▁▃ / ▁▃▇). Border accent when selected.
* **Team Select Tile**: Square tile, Dugout background, 4px radius. Outlined hover/select glow in `--color-team-tint`.
* **Tactical Timeline Track**: Thin line (1px Touchline), event nodes positioned by minute. Hover shows tooltip.
* **Primary Action Button**: Filled rectangle, 6px radius, background Hawk-Eye Cyan, text Pitch Night (`#0a0f14`).
* **Chat Composer**: Dugout background, 4px radius, 1px Touchline border (focus to Hawk-Eye Cyan).
