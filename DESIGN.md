---
version: "alpha"
name: Perficient
description: AI-first global consultancy. Premium, confident, modern — architectural precision meets editorial gravitas.
colors:
  primary: "#075056"
  secondary: "#024879"
  neutral: "#1b2227"
  accent: "#71d8c5"
  alert: "#fe3a39"
  sky: "#C5DCEE"
  light-gray: "#DFE7ED"
  grey-blue: "#5d798f"  # implementation-only, not in official brand spec
  error: "#fe6b64"      # implementation-only, not in official brand spec
  capri: "#4AB3E9"
  cobalt: "#324EB5"
  midnight: "#001A6E"
  purple: "#6F1D82"
gradients:
  primary-vertical: "linear-gradient(to bottom, #AACBE4 0%, #DEF0FF 50%, #EEF7FF 100%)"
  primary-horizontal: "linear-gradient(to right, #EEF7FF, #DEF0FF, #AACBE4)"
typography:
  h1:
    fontFamily: FK Screamer Legacy, Arial Narrow, Helvetica Neue, Arial, sans-serif
    fontSize: 5rem
    lineHeight: 0.95
    letterSpacing: 1px
    fontWeight: 400
    textTransform: uppercase
  h2:
    fontFamily: FK Screamer Legacy, Arial Narrow, Helvetica Neue, Arial, sans-serif
    fontSize: 4.25rem
    lineHeight: 0.85
    fontWeight: 400
    textTransform: uppercase
  h3:
    fontFamily: FK Screamer Legacy, Arial Narrow, Helvetica Neue, Arial, sans-serif
    fontSize: 3.75rem
    lineHeight: 0.85
    fontWeight: 400
    textTransform: uppercase
  h4:
    fontFamily: Noe Display, Georgia, Times New Roman, serif
    fontSize: 2rem
    lineHeight: 1.1
    fontWeight: 400
  h5:
    fontFamily: Noe Display, Georgia, Times New Roman, serif
    fontSize: 1.5rem
    lineHeight: 1.15
    fontWeight: 400
  h6:
    fontFamily: Noe Display, Georgia, Times New Roman, serif
    fontSize: 1.125rem
    lineHeight: 1.15
    fontWeight: 400
  body-lg:
    fontFamily: Untitled Sans, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif
    fontSize: 1.25rem
    lineHeight: 1.2
  body-md:
    fontFamily: Untitled Sans, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif
    fontSize: 1.125rem
    lineHeight: 1.3
  body-sm:
    fontFamily: Untitled Sans, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif
    fontSize: 1rem
    lineHeight: 1.25
  overline:
    fontFamily: Untitled Sans, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif
    fontSize: 0.875rem
    lineHeight: 1.428
    fontWeight: 700
    textTransform: uppercase
  stats:
    fontFamily: Noe Display, Georgia, Times New Roman, serif
    fontSize: 6.25rem
    lineHeight: 1
    fontWeight: 700
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 20px
  full: 9999px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.secondary}"
    textColor: "#ffffff"
    hoverBackgroundColor: "{colors.accent}"
    hoverTextColor: "{colors.neutral}"
    borderRadius: "{rounded.sm}"
    fontFamily: Untitled Sans, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif
    fontWeight: 400
    textTransform: uppercase
  button-alert:
    backgroundColor: "{colors.alert}"
    textColor: "#ffffff"
    borderRadius: "{rounded.sm}"
  card:
    backgroundColor: "#ffffff"
    borderRadius: "{rounded.lg}"
    shadow: "0px 4px 20px rgba(0, 0, 0, 0.08)"
  hero-card:
    backgroundColor: "#ffffff"
    borderRadius: "{rounded.xl}"
    shadow: "0px 8px 40px rgba(0, 0, 0, 0.12)"
---

## Overview

Perficient is the global AI-first consultancy. The visual identity projects **confidence**, **precision**, and **premium expertise** — like a high-end technology publication crossed with an architectural firm's portfolio.

Three typefaces create a clear hierarchy: FK Screamer Legacy commands attention in display headings (always uppercase), Noe Display brings editorial warmth to subheadings and stats, and Untitled Sans delivers clarity in body copy. The palette is anchored by "Blue Spruce" green (#075056) — deep, natural, authoritative — with Turquoise (#71d8c5) as the energizing accent and Navy (#024879) for interactive elements.

## Colors

The palette is rooted in deep, confident tones with a single bright accent.

- **Primary (#075056) "Blue Spruce":** The signature Perficient green. Used for the logo, key brand moments, and high-emphasis backgrounds.
- **Secondary (#024879) "Navy Blue":** Interactive elements — buttons, links, focus states. Conveys trust and action.
- **Neutral (#1b2227) "Brand Black":** Headlines, body text, and UI chrome. Not pure black — slightly warm.
- **Accent (#71d8c5) "Turquoise":** The energy color. Hover states, highlights, success indicators. Always paired with dark text.
- **Alert (#fe3a39) "Poppy":** Calls to action that demand immediate attention. Sparingly used.
- **Sky (#C5DCEE):** Soft borders, dividers, background tints. Gradient base color.
- **Light Gray (#DFE7ED):** Page backgrounds, section fills, subtle separation.
- **Grey Blue (#5d798f):** ⚠️ *Implementation-only (perficient.com CSS) — not in official brand spec.* Used for disabled button states.
- **Error (#fe6b64):** ⚠️ *Implementation-only (perficient.com CSS) — not in official brand spec.* Form validation, error states. Softer than Poppy.
- **Capri (#4AB3E9):** Tertiary — data visualization only.
- **Cobalt (#324EB5):** Tertiary — data visualization only.
- **Midnight (#001A6E):** Tertiary — data visualization. Exception: permitted for `<a>` link text on dark surfaces.
- **Purple (#6F1D82):** Tertiary — data visualization only.

Tertiary colors are **restricted** to data visualization and information graphics. Never use them at the highest level of the brand system (backgrounds, headings, buttons).

### Gradients

Two sanctioned gradients — both use Sky tones (light, airy).

- **Primary Vertical:** `linear-gradient(to bottom, #AACBE4 → #DEF0FF → #EEF7FF)` — hero backgrounds, section fills.
- **Primary Horizontal:** `linear-gradient(to right, #EEF7FF → #DEF0FF → #AACBE4)` — card backgrounds, subtle accents.

## Typography

Three font families in strict hierarchy. Never mix levels.

- **FK Screamer Legacy** — Display/heading font (H1–H3). Always uppercase. Tight line-height (0.85–0.95). Commanding, architectural.
- **Noe Display** — Serif editorial font (H4–H6, Stats). Regular weight. Warm, intelligent, approachable.
- **Untitled Sans** — Body copy and UI text. Clean geometric sans-serif. Regular (400) and Bold (700).

Desktop headings scale from 80px (H1) down to 18px (H6). Mobile reduces proportionally (H1: 72px, H2: 52px, H3: 48px). Stats are oversized numerals (100px desktop, 80px mobile) in Noe Display Bold.

## Layout & Spacing

- **Max container width:** 90rem (1440px)
- **Grid:** 12-column with responsive margins and gutters
- **Column padding:** 20px (sm/md breakpoints)
- **Section spacing:** Generous vertical rhythm — typically 64px–96px between major sections

## Elevation & Depth

Two card shadow levels:
- **Standard card:** `0px 4px 20px rgba(0, 0, 0, 0.08)` — subtle lift
- **Hero card:** `0px 8px 40px rgba(0, 0, 0, 0.12)` — prominent elevation

## Shapes

Border radius is conservative:
- Buttons: 4px (barely rounded — intentionally sharp)
- Cards: 12px
- Hero cards: 16px
- Pills/tags: 9999px (full round)

## Components

### Buttons
Navy blue (#024879) with white text, uppercase Untitled Sans. On hover, background shifts to Turquoise with dark text — a confident, energizing interaction. Minimal border-radius (4px) keeps them sharp and modern.

### Cards
White background, 12px radius, subtle shadow. Content cards use the standard shadow; hero/featured cards get the elevated shadow (8px/40px).

### Navigation
Brand Black text on white. Active/hover states use Primary green. Mobile hamburger menu with full-screen overlay.

## Data Visualization

Bespoke chart style using brand colors. Primary palette for data viz is a **Black-to-Turquoise gradient** — not the tertiary colors (those are for multi-series differentiation).

### Chart Color System

- **Primary fill:** Gradient from Brand Black (#1b2227) → Turquoise (#71d8c5), with the 25% midpoint as the transition
- **Secondary fills:** Blue Spruce (#075056) for darker segments, Turquoise for lighter/highlighted segments
- **Area fills:** Turquoise gradient (dark at base, light at top) for line graphs and area charts
- **Bar charts:** Turquoise-to-Blue Spruce gradient (vertical), darkest bar = highest value
- **Pie charts:** Blue Spruce for dominant segment, Turquoise for secondary, Light Gray for remainder

### Chart Elements

- **Axis labels:** Untitled Sans, regular weight, Brand Black
- **Data callouts:** Noe Display Bold (large numerals, e.g., "$38M", "75%") — same as Stats typography
- **Descriptive labels:** FK Screamer Legacy uppercase for category labels (e.g., "LORUM IPSUM")
- **Arrows:** Thin stroke, Brand Black, various directional styles (straight, curved, angled)
- **Identifiers:** Filled circles (Black or Turquoise) as legend markers

### Rules

- Lead with the Black → Turquoise gradient for single-series charts
- Use tertiary colors (Capri, Cobalt, Midnight, Purple) only when 3+ data series require differentiation
- Data callout numerals always use Noe Display Bold at large size
- Axis numerals use Untitled Sans at utility size
- Background for data viz sections: Light Gray (#DFE7ED) or white

## Graphic Language — Pattern Suite

Four geometric patterns form the brand's visual texture system. Each has two variations: **solid color** (shades of Sky) and **line work** (can overlay colors or photography).

### The Four Patterns

| Pattern | Shape | Description |
|---------|-------|-------------|
| **Pattern 1** | Arrows/chevrons | Overlapping directional arrows suggesting forward momentum |
| **Pattern 2** | Isometric cubes (flat) | Repeating 3D cube grid, tessellated |
| **Pattern 3** | Isometric cubes (scattered) | Same cube motif, loosely arranged with gaps |
| **Pattern 4** | Wireframe cubes | Line-only version of the cube grid — Turquoise strokes on dark backgrounds |

### Color Rules

- **Solid variation** uses three opacity levels of Sky (#C5DCEE): Sky 25%, Sky 75%, and full Sky
- **Solid variation background:** Always place on the brand gradient (vertical or horizontal). Gradient can be rotated 180° to suit format/crop.
- **Line work variation:** Turquoise (#71d8c5) strokes on Blue Spruce (#075056) or dark backgrounds. Can also overlay photography.
- **Never** use pattern fills in primary brand colors (Navy, Poppy) — patterns are always Sky tones or Turquoise wireframe.

### Usage

- Hero sections and landing page backgrounds (solid, with gradient behind)
- Presentation slide backgrounds
- Event signage and tradeshow materials
- Section dividers and visual texture (at low opacity)
- Line work version over dark photography for a technical/modern feel

## Iconography

Custom icon set — solid filled, geometric, minimal detail. Icons are a flexible component used across presentations, web, and marketing materials.

### Style

- **Filled solid** — no outlines or thin strokes. Bold, confident shapes.
- **Geometric construction** — built from simple shapes (diamonds, rectangles, circles)
- **Single color per icon** — never multi-colored

### Icon Examples

| Icon | Represents |
|------|-----------|
| 4-point stars (sparkle) | AI, innovation, new features |
| Bar chart | Data, analytics, growth |
| Tag/label | Commerce, pricing, offers |
| Stacked diamonds (layers) | Platform, architecture, integration |
| Chess knight | Strategy, planning |
| Flower/atom shape | Connectivity, ecosystem |

### Color Principles

Icons use only **two color pairings** depending on background:

| Background | Icon Color |
|-----------|-----------|
| Blue Spruce (#075056) | Turquoise (#71d8c5) |
| Turquoise (#71d8c5) | Blue Spruce (#075056) |
| Navy Blue (#024879) | Turquoise (#71d8c5) |
| Light Gray / White | Navy Blue (#024879) |

Never use Poppy, tertiary colors, or gradients for icons.

### Scale Principle

Icons can be used at dramatically different scales:
- **Hero/feature size** — single icon fills most of the frame (used for category pages, section intros)
- **Inline/UI size** — small, alongside text or in grid layouts (used for feature lists, navigation)

### Container Principle

Icons can be placed inside **rounded square containers** (Turquoise fill with Blue Spruce icon, or vice versa). Containers use `border-radius: 8px` and are used when icons overlay photography or busy backgrounds.

### Contained (Photo Mask) Principle

The stacked-diamond/layers icon shape can be used as a **clipping mask** for photography — creating a branded image frame. Used on Blue Spruce backgrounds for visual impact.

## Do's and Don'ts

**Do:**
- Use FK Screamer only for H1–H3 headings, always uppercase
- Pair Turquoise accent with dark text (never on light backgrounds)
- Maintain generous whitespace between sections
- Use Navy Blue for all interactive/clickable elements

**Don't:**
- Use FK Screamer for body text or small labels
- Mix heading levels across typefaces (H1–H3 = display, H4–H6 = serif)
- Use Poppy/Alert for anything other than critical actions or errors
- Apply rounded corners larger than 16px (except pills)
- Use pure black (#000000) — always use Brand Black (#1b2227)
