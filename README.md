# prft-brand-hook

A whip to enforce AI agents to produce assets that are on-brand with Perficient.

Native Claude Code hook — zero plugins, zero dependencies beyond Node.js. Scans generated visual artifacts against the Perficient design system and blocks non-compliant output.

## Install

Open a terminal in your project directory and run:

```bash
npx github:Perficient-Corporate/Perficient-Brand-Hook
```

That's it. One command. The hook is active immediately — no restart needed.

### Advisory-only mode

If you want warnings without blocking:

```bash
npx github:Perficient-Corporate/Perficient-Brand-Hook --loose
```

## What It Does

Every time Claude Code writes a visual file or runs a command that generates one, the hook:

1. **Before the write (PreToolUse):** Shows brand rules as a reminder
2. **After the write (PostToolUse):** Scans the generated output for actual violations and blocks if any are found

## Modes

| Mode | Behavior | When to use |
|------|----------|-------------|
| **strict** (default) | Blocks writes when violations are found (exit 2). Claude must fix before proceeding. | Production work, client deliverables, anything going external |
| **loose** | Shows violations as warnings but allows the write. Claude sees them, may or may not fix. | Early prototyping, experimentation, internal drafts |

Toggle anytime by editing `.claude/hooks/brand-compliance.config.json`:

```json
{
  "mode": "strict"
}
```

Change to `"warn"` for loose mode.

## What Gets Checked

14 design principle checkers, each independently toggleable:

| Checker | What it enforces |
|---------|-----------------|
| `core-tokens` | Only approved hex colors. Never #000000 (use Brand Black #1B2227). Border-radius ≤16px. |
| `gray-body-text` | Body text must be Brand Black (#1B2227) or white. No grays. |
| `sidebar-bars` | No colored left-border accent bars (web context). Brand uses whitespace for separation. |
| `card-backgrounds` | Cards/sections must be white. No colored fills. |
| `font-families` | Primary font must be FK Screamer Legacy, Noe Display, or Untitled Sans. |
| `heading-color` | Headings must be Brand Black, white, or Blue Spruce (hero only). |
| `type-hierarchy` | FK Screamer → H1-H3 only. Noe Display → H4-H6/stats only. Never mix. |
| `uppercase-rule` | FK Screamer must always have `text-transform: uppercase`. |
| `icon-color` | Icons must use Turquoise, Blue Spruce, or Navy only. |
| `spacing` | Max container width 1440px. Section spacing 64-96px. |
| `gradient-usage` | Gradients must use Sky tones only (outside hero sections). |
| `color-pairings` | Enforces text-on-background rules. Sky on Spruce = banned. Poppy never as text. |
| `color-proportions` | Checks color balance: Poppy ≤5%, tertiaries ≤4%, Turquoise ≤15%. *(always advisory, never blocks)* |
| `layout-busyness` | ≤5 distinct colors, ≤3 backgrounds. *(always advisory, never blocks)* |

### Disabling a checker

Edit `.claude/hooks/brand-compliance.config.json`:

```json
{
  "checkers": {
    "sidebar-bars": false,
    "layout-busyness": false
  }
}
```

## Context-Aware Rules

The hook detects whether output is for **web** or **presentations** and applies different rules:

| Rule | Web | Presentation |
|------|-----|--------------|
| Primary fonts | FK Screamer / Noe Display / Untitled Sans required | Georgia, Arial, Franklin Gothic Demi Cond also allowed (fallbacks for when brand fonts aren't installed) |
| Card backgrounds | White only | White or Light Grey (#E6EFF6) |
| Left-border accents | Not allowed | Allowed (Poppy stripe is a presentation motif) |
| Gradients | Sky tones only in hero sections | Not allowed (presentations must be flat) |

The hook detects presentation context when the file is `.pptx` or the bash command references PowerPoint/slides.

## Auto-Discovery

The hook automatically finds generated files even in non-standard directories using three-tier discovery:

1. **Stdout extraction** — if the build command prints a file path, scans that file
2. **Recency scan** — finds recently-modified `.html/.css/.svg` files anywhere in the project (for build tool commands like `tsx`, `vite`, `webpack`, etc.)
3. **Build-tool heuristic** — widens scan when known build tools are detected
4. **Fallback** — scans configured output directories (`dist`, `build`, `out`, `.next`, `public`)

Configure additional output directories in `.claude/hooks/brand-compliance.config.json`:

```json
{
  "scanOutputDirs": ["dist", "build", "out", ".next", "public", "reports"]
}
```

## What Gets Installed

```
your-project/
├── .claude/
│   ├── settings.json                    ← hook registration (merged with existing)
│   └── hooks/
│       ├── brand-compliance.cjs         ← the scanner (Node.js, cross-platform)
│       └── brand-compliance.config.json ← mode + checker toggles
└── DESIGN.md                            ← Perficient brand tokens + rationale
```

## Requirements

- Claude Code (any version with hook support)
- Node.js (already required by Claude Code)
- No plugins needed

## Compatibility

| Platform | Status |
|----------|--------|
| macOS | Tested |
| Linux | Untested (should work — pure Node.js) |
| Windows | Untested (architecture is cross-platform but not yet verified) |

| AI Agent | Status |
|----------|--------|
| Claude Code | Tested |
| Codex CLI | Untested (hook system is Claude Code-specific) |
| Cursor | Untested (hook system is Claude Code-specific) |
| Copilot CLI | Untested (hook system is Claude Code-specific) |
| Cortex Code | Untested (hook system is Claude Code-specific)

## Updating

Re-run the install command to get the latest version. It will overwrite the hook script and config while preserving your existing `.claude/settings.json` hooks.

```bash
npx github:Perficient-Corporate/Perficient-Brand-Hook
```

## How It Works (Technical)

### Hook Lifecycle

```
Claude Code tool call
    ↓
PreToolUse (before write)
    → brand-compliance.cjs receives JSON on stdin
    → Checks: is this a visual file or doc-gen command?
    → If yes: prints advisory message to stdout (Claude sees it)
    → Always exits 0 (never blocks before write)
    ↓
Tool executes (file written / command runs)
    ↓
PostToolUse (after write)
    → brand-compliance.cjs receives JSON on stdin
    → Discovers output files (3-tier discovery)
    → Parses CSS blocks once, passes to all enabled checkers
    → Collects violations: strict (⚠) vs advisory (💡)
    → If strict mode + strict violations: exits 2 (blocks)
    → If warn mode or advisory-only: exits 0 (reports but allows)
```

### Checker Registry

One monolithic script with a pluggable checker array. Each checker receives `{content, cssBlocks, filePath, context}` and returns `string[]` violations.

```js
{ id: 'checker-name', fn: checkerFunction, strictCapable: true|false }
```

- `strictCapable: true` — violations from this checker can block in strict mode
- `strictCapable: false` — always advisory (proportion, busyness heuristics)

### CSS Block Parser

Parses content once into `[{selector, properties: [{prop, value}]}]`. All checkers share this parsed structure — no redundant parsing.

Does NOT handle nested `@media` blocks (v1 limitation). Checkers that need media-query awareness fall back to raw content regex.

### Three-Tier File Discovery (PostToolUse Bash)

When a Bash command completes, the hook discovers generated files:

1. **Tier 1: Stdout extraction** — regex scans command output for file paths ending in `.html/.css/.svg`. Highest confidence, zero false positives.
2. **Tier 2: Recency scan** — walks CWD (max depth 4, skips `node_modules/.git`) for files modified within `scanRecencyMs`. Only fires for build-tool commands (`tsx`, `vite`, `webpack`, etc.).
3. **Tier 3: Build-tool heuristic** — if the command matches known build tools, widens scan to first-level subdirectories not already in `scanOutputDirs`.
4. **Tier 4: Fallback** — scans configured `scanOutputDirs` for recently-modified files.

Hard deadline: 4.5s (timeout is 5s). All tiers bail early if deadline approaches.

### Context Detection

The hook detects output format and switches rule sets:

- **Web** (default): strict font requirements, no sidebar bars, white-only card backgrounds
- **Presentation** (`.pptx` in file/command): allows fallback fonts (Georgia, Arial, Franklin Gothic), Light Grey card fills, Poppy left-accent borders

### Color Normalization

`normalizeToHex(value)` converts any CSS color format to lowercase 6-digit hex:
- `#075056` → `075056`
- `#abc` → `aabbcc`
- `rgb(7, 80, 86)` → `075056`
- `rgb(999, 0, 0)` → `ff0000` (clamped)

`extractAllColors(value)` returns ALL colors in a multi-value declaration (gradients), splitting scores evenly across them.

### Proportion Scoring

Weighted heuristic estimating visual area from CSS source:

```
score = selector_weight × property_weight
```

| Selector | Weight | Property | Weight |
|----------|--------|----------|--------|
| body/html | 10 | background | 5 |
| section/header/footer | 6 | fill/stroke | 3 |
| .hero/.container | 6 | color (text) | 2 |
| .card/.panel | 4 | border | 1 |
| div/article | 4 | box-shadow | 0 |
| h1-h6/p/li | 2 | non-visual | 0 |
| span/a/small | 1 | | |
| inline style="" | 3 | | |

Unrecognized colors still count toward `totalScore` (prevents inflating brand %). Multi-color declarations (gradients) split score evenly across colors.

### Fail Behavior

- Config missing/malformed → defaults to strict, logs to stderr
- Scanner error → logs to stderr, returns no violations (fail-open)
- Stdin timeout → 4s watchdog kills process (exit 0)
- Hook crash → top-level try/catch, exit 0 (never blocks on internal error)
