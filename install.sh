#!/bin/bash
# Perficient Brand Compliance Hook — Installer (macOS/Linux)
# Usage: ./install.sh [--strict] [target-project-directory]
#
# Installs the brand compliance hook + DESIGN.md into a target project.
# If no target is specified, installs into the current directory.
# Pass --strict to enable blocking mode (violations prevent writes).

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STRICT=false
TARGET=""

# Parse arguments
for arg in "$@"; do
  case "$arg" in
    --strict) STRICT=true ;;
    *) TARGET="$arg" ;;
  esac
done

TARGET="${TARGET:-.}"
TARGET="$(cd "$TARGET" && pwd)"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "✗ Node.js is required but not found on PATH."
  echo "  Claude Code requires Node.js — install it first."
  exit 1
fi

echo "🎨 Perficient Brand Compliance Hook Installer"
echo "   Target: $TARGET"
echo "   Mode:   $([ "$STRICT" = true ] && echo 'strict (blocking)' || echo 'warn (advisory)')"
echo ""

# 1. Create .claude/hooks/ in target
mkdir -p "$TARGET/.claude/hooks"

# 2. Copy hook script
cp "$SCRIPT_DIR/.claude/hooks/brand-compliance.js" "$TARGET/.claude/hooks/brand-compliance.js"
echo "✓ Copied brand-compliance.js"

# 3. Copy config (set mode based on --strict flag)
if [ "$STRICT" = true ]; then
  node -e "
    const config = JSON.parse(require('fs').readFileSync('$SCRIPT_DIR/.claude/hooks/brand-compliance.config.json', 'utf8'));
    config.mode = 'strict';
    require('fs').writeFileSync('$TARGET/.claude/hooks/brand-compliance.config.json', JSON.stringify(config, null, 2) + '\n');
  "
else
  cp "$SCRIPT_DIR/.claude/hooks/brand-compliance.config.json" "$TARGET/.claude/hooks/brand-compliance.config.json"
fi
echo "✓ Copied brand-compliance.config.json (mode: $([ "$STRICT" = true ] && echo 'strict' || echo 'warn'))"

# 4. Merge or create settings.json
SETTINGS="$TARGET/.claude/settings.json"
if [ -f "$SETTINGS" ]; then
  node -e "
    const fs = require('fs');
    const settings = JSON.parse(fs.readFileSync('$SETTINGS', 'utf8'));
    if (!settings.hooks) settings.hooks = {};

    const hookDef = { type: 'command', command: 'node .claude/hooks/brand-compliance.js', timeout: 5 };
    const hookEntry = (timeout) => ({
      matcher: 'Write|Edit|MultiEdit|Bash',
      hooks: [{ type: 'command', command: 'node .claude/hooks/brand-compliance.js', timeout }]
    });

    const alreadyInstalled = (arr) => (arr || []).some(h =>
      h.hooks && h.hooks.some(hk => hk.command && hk.command.includes('brand-compliance.js'))
    );

    if (!settings.hooks.PreToolUse) settings.hooks.PreToolUse = [];
    if (!alreadyInstalled(settings.hooks.PreToolUse)) {
      settings.hooks.PreToolUse.push(hookEntry(3));
    }

    if (!settings.hooks.PostToolUse) settings.hooks.PostToolUse = [];
    if (!alreadyInstalled(settings.hooks.PostToolUse)) {
      settings.hooks.PostToolUse.push(hookEntry(5));
    }

    fs.writeFileSync('$SETTINGS', JSON.stringify(settings, null, 2) + '\n');
    console.log('✓ Merged hooks into existing settings.json');
  "
else
  cp "$SCRIPT_DIR/.claude/settings.json" "$SETTINGS"
  echo "✓ Created settings.json"
fi

# 5. Copy DESIGN.md if not present
if [ ! -f "$TARGET/DESIGN.md" ]; then
  if [ -f "$SCRIPT_DIR/DESIGN.md" ]; then
    cp "$SCRIPT_DIR/DESIGN.md" "$TARGET/DESIGN.md"
    echo "✓ Copied DESIGN.md"
  else
    echo "⚠ DESIGN.md not found in installer directory — skipping"
  fi
else
  echo "✓ DESIGN.md already exists (skipped)"
fi

echo ""
echo "Done! Brand compliance hook is active."
echo ""
echo "  Warn mode:   Claude sees reminders, writes proceed normally"
echo "  Strict mode:  Violations block writes until fixed"
echo ""
echo "  Toggle: edit .claude/hooks/brand-compliance.config.json → \"mode\": \"strict\"|\"warn\""
