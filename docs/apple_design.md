# Apple (España) — Style Reference
> obsidian gallery vitrine — a dark showroom where a single titanium object glows against pure black

**Theme:** mixed

Apple's product page is a cinematic dark-stage that lets hardware speak first: full-bleed near-black canvas, a single hero product floating in negative space, white SF Pro Display headlines at massive scale, and one vivid blue Buy button as the only saturated action color on the page. The page alternates between black feature stages and white detail bands, using generous 28px card radii and 36–980px pill buttons to feel premium and tactile. Color is used as functional punctuation: orange for category eyebrows, blue for links and the single CTA, violet/teal for other product categories. Typography is the only chrome — heavy negative letter-spacing, tight line-heights, and weight contrast between SF Pro Text body and SF Pro Display headlines carry all the hierarchy.

## Tokens — Colors

| Name | Token | Value | Role |
| :--- | :--- | :--- | :--- |
| **Obsidian** | `--color-obsidian` / `--surface-obsidian-card` | `#1d1d1f` | Primary dark canvas, card surfaces on dark sections, primary text on light backgrounds — the signature near-black |
| **Frost White** | `--color-frost-white` / `--surface-frost-white-panel` | `#f5f5f7` | Primary text on dark backgrounds, light section surfaces, subtle dividers — slightly warm white |
| **Pure Black** | `--color-pure-black` / `--surface-pure-black-stage` | `#000000` | Deepest dark canvas for hero and feature stages, footer background |
| **Paper White** | `--color-paper-white` / `--surface-paper-white` | `#ffffff` | Light section backgrounds, button text on dark fills, icon fills — the bright counterweight |
| **Carbon** | `--color-carbon` / `--surface-carbon-layer` | `#111111` | Elevated surface above black, badge backgrounds — sits one step lighter than pure black |
| **Platinum** | `--color-platinum` | `#86868b` | Muted body text, secondary descriptions, subtitle lines, caption text |
| **Graphite** | `--color-graphite` / `--surface-graphite-surface` | `#333336` | Subtle elevated surfaces, secondary button backgrounds, nav dividers |
| **Silver Mist** | `--color-silver-mist` | `#cccccc` | Nav borders, button outlines, inactive UI chrome |
| **Smoke** | `--color-smoke` | `#424245` | Hairline borders, low-contrast dividers on dark sections |
| **Apple Blue** | `--color-apple-blue` | `#0071e3` | Primary CTA fill (Comprar button), primary action background — single filled chromatic color |
| **Link Blue** | `--color-link-blue` | `#0066cc` | Text links, inline link text, Learn more arrows |
| **Halo Blue** | `--color-halo-blue` | `#2997ff` | Lighter link variant, accent text on dark backgrounds, secondary link color |
| **Signal Orange** | `--color-signal-orange` | `#f56900` | Orange outline accent for tags, dividers, and focused UI edges. Do not promote it to CTA |
| **Iris Violet** | `--color-iris-violet` | `#8668ff` | Secondary category accent, alternate product-line color coding |
| **Reef Teal** | `--color-reef-teal` | `#00a1b3` | Tertiary category accent, alternate product-line color coding |

## Tokens — Typography

* **Font Families**:
  * Display: `--font-sf-pro-display` = `'SF Pro Display', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`
  * Text: `--font-sf-pro-text` = `'SF Pro Text', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`

### Typography Scale & Line Heights

| Step Token | Font Size | Font Weight | Line Height | Font Family | Role / Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--text-xs` | 10px | 600 | 1.24 | SF Pro Text | Caption spec |
| `--text-xs-2` | 12px | 400 | 1.00 | SF Pro Text | Micro text label |
| `--text-xs-3` | 12px | 400 | 1.83 | SF Pro Text | Footnote details |
| `--text-xs-4` | 12px | 400 | 1.33 | SF Pro Text | Tiny notes block |
| `--text-xs-5` | 12px | 600 | 1.33 | SF Pro Text | Emphasized tiny notes |
| `--text-sm` | 14px | 400 | 1.43 | SF Pro Text | Body text |
| `--text-lg` | 17px | 400 | 1.47 | SF Pro Text | Body paragraph |
| `--text-lg-2` | 17px | 600 | 1.24 | SF Pro Text | Nav items / buttons |
| `--text-lg-3` | 17px | 400 | 1.47 | SF Pro Text | Inline narrative |
| `--text-lg-4` | 17px | 400 | 1.24 | SF Pro Text | Description labels |
| `--text-lg-5` | 17px | 400 | 1.00 | SF Pro Text | Inline status |
| `--text-lg-6` | 17px | 600 | 1.47 | SF Pro Text | Subheading copy |
| `--text-lg-7` | 17px | 400 | 1.18 | SF Pro Text | Product specs |
| `--text-lg-8` | 19px | 600 | 1.21 | SF Pro Display | Small headers |
| `--text-xl` | 20px | 400 | 1.47 | SF Pro Text | Card descriptions |
| `--text-xl-2` | 20px | 600 | 1.47 | SF Pro Text | Bold card descriptions |
| `--text-xl-3` | 21px | 600 | 1.14 | SF Pro Display | Medium card headers |
| `--text-xl-4` | 21px | 600 | 1.19 | SF Pro Display | Alternate card headers |
| `--text-2xl` | 24px | 600 | 1.17 | SF Pro Display | Standard card titles |
| `--text-2xl-2` | 28px | 600 | 1.14 | SF Pro Display | Section section titles |
| `--text-3xl` | 32px | 700 | 1.13 | SF Pro Display | Large content headers |
| `--text-4xl` | 44px | 400 | 1.00 | SF Pro Text | Specs headlines |
| `--text-5xl` | 56px | 600 | 1.00 | SF Pro Display | Section opener titles |
| `--text-5xl-2` | 80px | 600 | 1.05 | SF Pro Display | Hero display titles |

* **Letter Spacing Rules**:
  * Display: `-0.015em` at 19px → `-0.003em` at 80px (character density tightens as size increases)
  * Text: `-0.037em` at 10px → `-0.010em` at 20px (loosens as size shrinks for micro-legibility)

## Tokens — Spacing & Radius

* **Base Unit**: `4px`
* **Spacing Scale**:
  * `--spacing-4`: `4px`
  * `--spacing-8`: `8px`
  * `--spacing-12`: `12px`
  * `--spacing-16`: `16px`
  * `--spacing-20`: `20px`
  * `--spacing-24`: `24px`
  * `--spacing-28`: `28px`
  * `--spacing-32`: `32px`
  * `--spacing-40`: `40px`
  * `--spacing-48`: `48px`
  * `--spacing-60`: `60px`
  * `--spacing-76`: `76px`
  * `--spacing-80`: `80px`
  * `--spacing-96`: `96px`
  * `--spacing-104`: `104px`
  * `--spacing-160`: `160px`
* **Border Radius**:
  * `--radius-lg`: `10px` (links / small overlays)
  * `--radius-3xl`: `28px` (cards / content panels)
  * `--radius-3xl-2`: `32px` (large container sections)
  * `--radius-3xl-3`: `36px` (pill button selectors)
  * `--radius-full`: `980px` (top sticky nav pill / status pills)
* **Layout Measures**:
  * `--page-max-width`: `1440px`
  * `--section-gap`: `88px` to `120px`
  * `--card-padding`: `28px`
  * `--element-gap`: `10px` to `12px`
