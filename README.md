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

```
┌─────────────────────────────────────────────────────────┐
│ Claude Code tool call (Write/Edit/Bash)                  │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ PreToolUse                                              │
│  → Visual file or doc-gen command? → Print advisory     │
│  → Always exit 0 (never blocks)                         │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Tool executes                                           │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ PostToolUse                                             │
│  → Discover files (4-tier: stdout → recency → build    │
│    heuristic → config dirs)                             │
│  → Parse CSS blocks once                                │
│  → Run 14 checkers against parsed blocks                │
│  → Strict violations? exit 2 (block) : exit 0 (allow)  │
└─────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision | Why |
|----------|-----|
| Single `.cjs` script | Works in ESM projects; one process = shared CSS parse |
| Checker registry | Each checker is `{id, fn, strictCapable}` — toggleable via config |
| Pre-parsed CSS blocks | Parse once, pass `{content, cssBlocks, filePath, context}` to all |
| `normalizeToHex()` | Handles `#hex`, `#shorthand`, `rgb()` — clamped to 0-255 |
| `extractAllColors()` | Splits gradient scores evenly across all colors |
| Context detection | `.pptx` in file/command → presentation rules (looser fonts, allows Poppy bars) |
| 4.5s deadline | Hard bail in all filesystem walkers (timeout is 5s) |
| Fail-open | Config error / crash / stdin timeout → exit 0, never blocks |

### Proportion Scoring Weights

```
score = selector_weight × property_weight

Selectors:  body=10  section=6  .hero=6  .card=4  div=4  h1-h6=2  span=1  inline=3
Properties: background=5  fill=3  color=2  border=1  non-visual=0
```

Unrecognized colors count toward total (prevents inflated brand %). Gradients split evenly.
