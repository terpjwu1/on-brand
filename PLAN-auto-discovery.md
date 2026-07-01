# Plan: Three-Tier Auto-Discovery for PostToolUse Scanning

## Problem

The PostToolUse hook only scans hardcoded output directories (`dist`, `build`, `out`, `.next`, `public`). Real projects put generated HTML in arbitrary locations (e.g., `eval/results/`, `reports/`, `coverage/`). Users shouldn't have to manually configure every output path.

Additionally, the Bash event only triggers on `.pptx/.pdf/.docx` patterns — missing build tool invocations like `npx tsx`, `vite build`, etc. that generate HTML/CSS.

## Solution: Three-Tier Discovery

When a Bash PostToolUse event fires, apply these tiers in order. Each tier adds files to the scan list. Stop early if the 5s timeout approaches.

### Tier 1: Stdout Path Extraction

Regex scan the command's stdout for file paths ending in `.html`, `.css`, `.svg`.
- Highest confidence — the tool told us exactly what it wrote
- Zero false positives
- Already partially implemented, just needs to be more robust

### Tier 2: Recency Scan

Walk CWD recursively (max depth 4) for files matching `.html/.css/.svg` modified within `command_wall_time + 2s`.
- Skip `node_modules`, `.git`, `.next/cache`, `__pycache__`
- Hard 5s deadline check inside the loop — bail if approaching timeout
- Catches the common case: script runs, produces output, hook fires immediately after

### Tier 3: Build-Tool Heuristic

If the command matches known build tools:
```
/\b(tsx|tsc|vite|next\s+build|webpack|esbuild|rollup|parcel|gulp|grunt)\b/
```
...widen the scan to first-level subdirectories of CWD (not just `scanOutputDirs`).
- Only scans one level of subdirectories (not deep recursive)
- Still applies recency filter
- Catches `npx tsx eval/generate-report.ts` → scans `eval/` and finds `eval/results/report.html`

### Tier 4: Fallback

Existing `scanOutputDirs` behavior — scan configured directories for recently-modified files.

## New Config Field

```json
{
  "autoDiscover": true,
  "scanOutputDirs": ["dist", "build", "out", ".next", "public"],
  "scanRecencyMs": 30000,
  "maxFilesToScan": 20
}
```

`autoDiscover: true` (default) enables tiers 1-3. Set to `false` to use only scanOutputDirs (tier 4).

## Implementation Changes

### `brand-compliance.js`

1. Add `SKIP_DIRS` constant: `node_modules`, `.git`, `.next/cache`, `__pycache__`, `.venv`
2. Add `BUILD_TOOLS` regex: `/\b(tsx|tsc|vite|next\s+build|webpack|esbuild|rollup|parcel|gulp|grunt)\b/i`
3. Refactor `findOutputFiles()` into tiered discovery:
   - `discoverFromStdout(stdout)` → Tier 1
   - `discoverByRecency(startTime)` → Tier 2
   - `discoverByBuildHeuristic(command)` → Tier 3
   - Existing `scanOutputDirs` logic → Tier 4
4. Add deadline checking: `const deadline = Date.now() + 4500` (leave 500ms headroom)
5. Track `commandStartTime` from tool_response metadata if available, else use `Date.now() - scanRecencyMs`

### Config loading

- Add `autoDiscover` field (default: `true`)
- Validate as boolean, fall back to `true` if malformed

## Performance Guardrails

- Max depth 4 on recursive walks
- Skip known heavy dirs (`node_modules`, `.git`)
- Hard deadline at 4.5s (timeout is 5s, leave headroom)
- Max 20 files scanned (configurable)
- Max 1MB per file
- Bail early if all tiers found 0 candidates

## Verification

```bash
# Simulate: tsx command that produced output 2s ago
touch -t $(date -v-2S +%Y%m%d%H%M.%S) /tmp/test-project/eval/results/report.html
echo '{"hook_event_name":"PostToolUse","tool_name":"Bash","tool_input":{"command":"npx tsx eval/generate-report.ts"},"tool_response":{"stdout":"Done."}}' | node .claude/hooks/brand-compliance.js

# Should find eval/results/report.html via Tier 2 (recency) or Tier 3 (tsx heuristic)
```
