#!/usr/bin/env node
// prft-brand-hook installer
// Run: npx github:Perficient-Corporate/prft-brand-hook

const fs = require('fs');
const path = require('path');

const TARGET = process.cwd();
const SOURCE = path.resolve(__dirname, '..');
const LOOSE = process.argv.includes('--loose');

console.log('');
console.log('🎨 Perficient Brand Compliance Hook');
console.log(`   Installing into: ${TARGET}`);
console.log(`   Mode: ${LOOSE ? 'warn (advisory)' : 'strict (blocking)'}`);
console.log('');

// 1. Create .claude/hooks/
const hooksDir = path.join(TARGET, '.claude', 'hooks');
fs.mkdirSync(hooksDir, { recursive: true });

// 2. Copy hook script
const hookSrc = path.join(SOURCE, '.claude', 'hooks', 'brand-compliance.cjs');
const hookDest = path.join(hooksDir, 'brand-compliance.cjs');
fs.copyFileSync(hookSrc, hookDest);
console.log('✓ Copied brand-compliance.cjs');

// 3. Copy config (apply --loose if requested)
const configSrc = path.join(SOURCE, '.claude', 'hooks', 'brand-compliance.config.json');
const configDest = path.join(hooksDir, 'brand-compliance.config.json');
if (LOOSE) {
  const config = JSON.parse(fs.readFileSync(configSrc, 'utf8'));
  config.mode = 'warn';
  fs.writeFileSync(configDest, JSON.stringify(config, null, 2) + '\n');
} else {
  fs.copyFileSync(configSrc, configDest);
}
console.log(`✓ Copied brand-compliance.config.json (mode: ${LOOSE ? 'warn' : 'strict'})`);

// 4. Merge or create settings.json
const settingsPath = path.join(TARGET, '.claude', 'settings.json');
const hookEntry = (timeout) => ({
  matcher: 'Write|Edit|MultiEdit|Bash',
  hooks: [{ type: 'command', command: 'node .claude/hooks/brand-compliance.cjs', timeout }]
});

const alreadyInstalled = (arr) => (arr || []).some(h =>
  h.hooks && h.hooks.some(hk => hk.command && hk.command.includes('brand-compliance.cjs'))
);

if (fs.existsSync(settingsPath)) {
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  if (!settings.hooks) settings.hooks = {};

  if (!settings.hooks.PreToolUse) settings.hooks.PreToolUse = [];
  if (!alreadyInstalled(settings.hooks.PreToolUse)) {
    settings.hooks.PreToolUse.push(hookEntry(3));
  }

  if (!settings.hooks.PostToolUse) settings.hooks.PostToolUse = [];
  if (!alreadyInstalled(settings.hooks.PostToolUse)) {
    settings.hooks.PostToolUse.push(hookEntry(5));
  }

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log('✓ Merged hooks into existing .claude/settings.json');
} else {
  const settingsSrc = path.join(SOURCE, '.claude', 'settings.json');
  fs.copyFileSync(settingsSrc, settingsPath);
  console.log('✓ Created .claude/settings.json');
}

// 5. Copy DESIGN.md if not present
const designDest = path.join(TARGET, 'DESIGN.md');
if (!fs.existsSync(designDest)) {
  const designSrc = path.join(SOURCE, 'DESIGN.md');
  if (fs.existsSync(designSrc)) {
    fs.copyFileSync(designSrc, designDest);
    console.log('✓ Copied DESIGN.md');
  } else {
    console.log('⚠ DESIGN.md not found in package — skipping');
  }
} else {
  console.log('✓ DESIGN.md already exists (skipped)');
}

console.log('');
console.log('Done! Brand compliance is active in Claude Code for this project.');
console.log('');
console.log('  Default: strict (blocks on violations)');
console.log('  Toggle:  edit .claude/hooks/brand-compliance.config.json → "mode": "warn"');
console.log('');
