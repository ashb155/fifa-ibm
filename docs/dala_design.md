# Your workplace has the answer. Just ask Dala for it. — Style Reference
> Particle cosmos on a void — violet pulse against infinite black

**Theme:** dark

Dala is a knowledge-management product rendered as a dark cosmic field: a pure black canvas, a single saturated violet as the only authority color, and white type that glows against the void. The interface recedes — sparse text blocks, hairline borders, pill controls — while a massive particle constellation dominates the visual real estate, its thousands of tiny geometric shapes (triangles, circles, diamonds) clustering into organic forms. Typography is stretched and ultra-tight at display sizes (negative tracking pushes letters almost together) but opens up at body sizes (slight positive tracking aids legibility on black). Components feel lightweight and fast: no shadows, no gradients, no card elevation — depth comes purely from color contrast and the negative space of the void.

## Tokens — Colors

| Name | Token | Value | Role |
| :--- | :--- | :--- | :--- |
| **Void** | `--color-void` / `--surface-void` | `#000000` | Page background, primary canvas — every section and component sits directly on black, no nested surface layers |
| **Bone** | `--color-bone` | `#ffffff` | Primary text, icon strokes, hairlines, card borders, nav text — the only light that reads on the void |
| **Ash** | `--color-ash` | `#bdbdbd` | Secondary muted text, subtle border accents — quieter than bone, still legible on black |
| **Smoke** | `--color-smoke` | `#9a9a9a` | Tertiary text, nav link resting state, low-emphasis dividers — fades into the background |
| **Plum Voltage** | `--color-plum-voltage` | `#8052ff` | Primary action background, nav accents, icon highlights, decorative borders — the brand pulse, the only filled chromatic surface in the UI |
| **Amber Spark** | `--color-amber-spark` | `#ffb829` | Yellow accent for outlined action borders, linked labels, and lightweight interactive emphasis. Do not promote it to the primary CTA color |
| **Lichen** | `--color-lichen` | `#15846e` | Decorative icon accent, constellation node color — appears in illustration marks, not core interface chrome |

## Tokens — Typography

* **Font Family**: `--font-acronym` = `'Acronym', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`
* **Font Weights**:
  * Extralight: `200` (etched display headlines)
  * Regular: `400` (body copy)
  * Semibold: `600` (buttons, subheaders)
  * Bold: `700` (strong highlights)

### Typography Scale & Line Heights

| Step Token | Font Size | Font Weight | Line Height | Role / Description |
| :--- | :--- | :--- | :--- | :--- |
| `--text-xs` | 12px | 400 | 1.5 | Caption / secondary metadata |
| `--text-xs-2` | 12px | 600 | 1.0 | Micro navigation label |
| `--text-xs-3` | 12px | 600 | 1.2 | Compact metadata |
| `--text-xs-4` | 12px | 400 | 1.3 | Micro text block |
| `--text-xs-5` | 12px | 600 | 1.2 | Compact emphasis |
| `--text-sm` | 14px | 600 | 1.2 | Navigation link / active tags |
| `--text-sm-2` | 14px | 600 | 0.81 | Tight banner header label |
| `--text-base` | 15px | 400 | 1.5 | Standard body paragraph |
| `--text-base-2` | 15px | 600 | 1.5 | Bold body paragraph |
| `--text-lg` | 18px | 200 | 1.5 | Light subheadings / quotes |
| `--text-lg-2` | 18px | 400 | 1.5 | Standard subheadings |
| `--text-2xl` | 24px | 700 | 1.5 | Card headers / secondary section titles |
| `--text-2xl-2` | 24px | 400 | 1.25 | Fluid content headers |
| `--text-2xl-3` | 27px | 400 | 1.0 | Clean Display openers |
| `--text-4xl` | 36px | 400 | 1.2 | Large section sub-openers |
| `--text-4xl-2` | 42px | 400 | 1.2 | Primary feature titles |
| `--text-5xl` | 48px | 400 | 1.1 | Large display headlines |
| `--text-5xl-2` | 78px | 400 | 1.1 | Hero Display title |
| `--text-5xl-3` | 78px | 400 | 0.9 | Hero Display title (Tight display) |
| `--text-5xl-4` | 113px | 400 | 1.1 | Extreme display / scoreboards |

* **Letter Spacing Rules**:
  * Display (48px and above): `-0.04em` (pulls glyphs tight)
  * Body/Nav (18px and below): `+0.021em` to `+0.05em` (opens text on dark canvas for high legibility)

## Tokens — Spacing & Radius

* **Base Unit**: `6px`
* **Spacing Scale**:
  * `--spacing-6`: `6px`
  * `--spacing-12`: `12px`
  * `--spacing-18`: `18px`
  * `--spacing-24`: `24px`
  * `--spacing-30`: `30px`
  * `--spacing-36`: `36px`
  * `--spacing-60`: `60px`
  * `--spacing-96`: `96px`
  * `--spacing-120`: `120px`
  * `--spacing-unit`: `6px`
* **Border Radius**:
  * `--radius-3xl`: `24px`
  * `--radius-nav`: `24px`
  * `--radius-cards`: `24px`
  * `--radius-buttons`: `24px`
* **Layout Measures**:
  * `--page-max-width`: `1200px`
  * `--section-gap`: `60px`
  * `--card-padding`: `24px`
  * `--element-gap`: `15px`
