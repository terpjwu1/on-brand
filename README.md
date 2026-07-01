# prft-brand-hook

A native Claude Code hook that enforces Perficient brand compliance on generated visual artifacts. Zero dependencies beyond Node.js (which Claude Code already requires).

## What It Does

When Claude Code writes or generates visual files (.html, .css, .tsx, .jsx, .vue, .svelte, .svg, .pptx, .pdf, .docx, .xlsx), the hook automatically injects brand token reminders — colors, typography, component specs, and do's/don'ts from `DESIGN.md`.

This ensures every generated artifact stays on-brand without manual checking.

## Install

### macOS / Linux

```bash
./install.sh /path/to/your/project
```

### Windows (PowerShell)

```powershell
.\install.ps1 -Target C:\path\to\your\project
```

### Manual

Copy these into your project:

1. `.claude/hooks/brand-compliance.js` → your project's `.claude/hooks/`
2. `.claude/settings.json` → your project's `.claude/` (merge if one exists)
3. `DESIGN.md` → your project root

## What Gets Installed

```
your-project/
├── .claude/
│   ├── settings.json          ← registers the hook with Claude Code
│   └── hooks/
│       └── brand-compliance.js  ← the checker (Node.js, cross-platform)
└── DESIGN.md                  ← Perficient brand tokens + rationale
```

## How It Works

- The hook registers as a `PreToolUse` handler in Claude Code's native hook system
- Fires before Write/Edit/Bash operations that involve visual file extensions
- Prints brand compliance reminders to stdout → Claude sees them as context
- `action: warn` — advises but never blocks

## Requirements

- Claude Code (any version with hook support)
- Node.js (already required by Claude Code)
- No plugins needed

## Customizing

Edit `.claude/hooks/brand-compliance.js` to adjust:
- `VISUAL_EXTENSIONS` — which file types trigger the check
- `DOC_GEN_PATTERN` — which bash output patterns trigger the check
- The `message` string — what brand rules are shown

Edit `DESIGN.md` to update brand tokens when the design system changes.
