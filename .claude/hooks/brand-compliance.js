#!/usr/bin/env node
// Perficient Brand Compliance Hook
//   PreToolUse  — advisory reminder before writing visual files
//   PostToolUse — scans generated output for actual brand violations
//
// Config: .claude/hooks/brand-compliance.config.json
//   mode: "warn" (default) | "strict" (exit 2 to block on violations)

const fs = require('fs');
const path = require('path');

// --- Config loading (fail-open: missing/malformed config = warn mode) ---
function loadConfig() {
  const defaults = {
    mode: 'warn',
    scanOutputDirs: ['dist', 'build', 'out', '.next', 'public'],
    scanRecencyMs: 30000,
    maxFilesToScan: 20
  };
  try {
    const configPath = path.resolve('.claude/hooks/brand-compliance.config.json');
    if (!fs.existsSync(configPath)) return defaults;
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      mode: ['warn', 'strict'].includes(parsed.mode) ? parsed.mode : 'warn',
      scanOutputDirs: Array.isArray(parsed.scanOutputDirs) ? parsed.scanOutputDirs : defaults.scanOutputDirs,
      scanRecencyMs: Math.min(Math.max(Number(parsed.scanRecencyMs) || 30000, 5000), 120000),
      maxFilesToScan: Math.min(Math.max(Number(parsed.maxFilesToScan) || 20, 1), 100)
    };
  } catch (e) {
    return defaults;
  }
}

// --- Constants ---
const VISUAL_EXTENSIONS = /\.(html|css|scss|less|tsx|jsx|vue|svelte|svg|pptx|ppt|pdf|docx|doc|xlsx)$/i;
const DOC_GEN_PATTERN = /\.(pptx|pdf|docx|xlsx|ppt|doc)\b/i;
const SCANNABLE_EXTENSIONS = /\.(html|css|scss|less|svg)$/i;

// Brand-approved colors (lowercase, no #)
const APPROVED_COLORS = new Set([
  '075056', '024879', '71d8c5', '1b2227', 'fe3a39',
  'c5dcee', 'dfe7ed', '5d798f', 'fe6b64', '4ab3e9',
  '324eb5', '001a6e', '6f1d82', 'ffffff',
  'aacbe4', 'def0ff', 'eef7ff'
]);

// No `g` flag — .test() must be stateless
const PURE_BLACK_CSS = /(?:color|background|border|fill|stroke)\s*:\s*#000000\b/i;
const PURE_BLACK_SVG = /(?:fill|stroke)=["']#000000["']/i;
const PURE_BLACK_ANY = /#000000\b/i;

// --- Violation scanner ---
function scanFileForViolations(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const stat = fs.statSync(filePath);
    if (stat.size > 1024 * 1024) return []; // skip files > 1MB
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];

    // Check for pure black (#000000) in any context
    if (PURE_BLACK_CSS.test(content) || PURE_BLACK_SVG.test(content)) {
      violations.push('Uses #000000 (pure black) — should be #1B2227 (Brand Black)');
    }

    // Check for unapproved hex colors
    const badColors = new Set();
    const hexRegex = /#([0-9a-fA-F]{6})\b/g;
    let match;
    while ((match = hexRegex.exec(content)) !== null) {
      const color = match[1].toLowerCase();
      if (!APPROVED_COLORS.has(color)) {
        badColors.add('#' + match[1]);
      }
    }
    if (badColors.size > 0) {
      const list = [...badColors].slice(0, 5).join(', ');
      const more = badColors.size > 5 ? ` (+${badColors.size - 5} more)` : '';
      violations.push(`Unapproved colors: ${list}${more}`);
    }

    // Check for border-radius > 16px (except 9999px pills)
    const radiusRegex = /border-radius\s*:\s*(\d+)px/g;
    while ((match = radiusRegex.exec(content)) !== null) {
      const px = parseInt(match[1], 10);
      if (px > 16 && px !== 9999) {
        violations.push(`border-radius: ${px}px exceeds max 16px (only 9999px pills allowed)`);
        break;
      }
    }

    return violations;
  } catch (e) {
    return [];
  }
}

// --- Recursive directory walker (Node 14+ compatible) ---
function walkDir(dir, pattern, maxDepth, depth) {
  if (depth === undefined) depth = 0;
  if (depth > maxDepth) return [];
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && depth < maxDepth) {
        results.push(...walkDir(full, pattern, maxDepth, depth + 1));
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(full);
      }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}

// --- Find output files from bash commands ---
function findOutputFiles(command, stdout, config) {
  const files = [];

  // Extract file paths from command and stdout
  // Handle: quoted paths, Windows backslashes, drive letters, spaces
  const pathPatterns = [
    /["']([^"']+\.(html|css|svg))["']/gi,
    /(?:[A-Za-z]:\\|\.{0,2}[\\/])[\w\s.\\/\\-]+\.(html|css|svg)/gi,
    /[\w.\/-]+\.(html|css|svg)/gi
  ];

  const sources = [command, stdout || ''];
  for (const source of sources) {
    for (const pattern of pathPatterns) {
      let m;
      while ((m = pattern.exec(source)) !== null) {
        const p = (m[1] || m[0]).replace(/["']/g, '');
        try {
          const resolved = path.resolve(p);
          if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
            files.push(resolved);
          }
        } catch (e) { /* skip invalid paths */ }
      }
    }
  }

  // Scan common output directories for recently modified files
  for (const dir of config.scanOutputDirs) {
    const resolved = path.resolve(dir);
    if (!resolved.startsWith(process.cwd())) continue; // safety: only relative dirs
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      const candidates = walkDir(resolved, SCANNABLE_EXTENSIONS, 3);
      for (const file of candidates) {
        try {
          const stat = fs.statSync(file);
          if (Date.now() - stat.mtimeMs < config.scanRecencyMs) {
            files.push(file);
          }
        } catch (e) { /* skip */ }
      }
    }
  }

  return [...new Set(files)];
}

// --- Collect file paths from tool input (handles Write, Edit, MultiEdit) ---
function getFilePaths(toolName, toolInput) {
  const paths = [];
  if (toolInput?.file_path) paths.push(toolInput.file_path);
  if (toolInput?.file_paths && Array.isArray(toolInput.file_paths)) {
    paths.push(...toolInput.file_paths);
  }
  // MultiEdit may have edits array
  if (toolInput?.edits && Array.isArray(toolInput.edits)) {
    for (const edit of toolInput.edits) {
      if (edit.file_path) paths.push(edit.file_path);
    }
  }
  return [...new Set(paths)];
}

// --- Main ---
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => raw += chunk);
process.stdin.on('end', () => {
  try {
    const config = loadConfig();
    const input = JSON.parse(raw);
    const toolName = input.tool_name || input.toolName || '';
    const hookEvent = input.hook_event_name || input.hook_event || input.hookEvent || '';

    // === PreToolUse: Advisory reminder (always exit 0) ===
    if (hookEvent === 'PreToolUse' || (!hookEvent && !input.tool_response)) {
      let shouldWarn = false;

      if (['Write', 'Edit', 'MultiEdit'].includes(toolName)) {
        const paths = getFilePaths(toolName, input.tool_input);
        shouldWarn = paths.some(p => VISUAL_EXTENSIONS.test(p));
      }

      if (toolName === 'Bash') {
        const command = input.tool_input?.command || '';
        if (DOC_GEN_PATTERN.test(command)) {
          shouldWarn = true;
        }
      }

      if (shouldWarn) {
        console.log([
          '🎨 Brand Compliance — verify against DESIGN.md:',
          'Colors: #075056 (Blue Spruce), #024879 (Navy), #71D8C5 (Turquoise), #1B2227 (Brand Black), #FE3A39 (Alert). Never #000000.',
          'Type: FK Screamer Legacy (H1-H3 uppercase), Noe Display (H4-H6/stats), Untitled Sans (body/UI).',
          'Components: Buttons=Navy+white+uppercase+4px radius. Cards=white+12px+shadow.',
          "Don'ts: No FK Screamer for body, no corners>16px (except pills), no tertiary colors outside dataviz."
        ].join('\n'));
      }
      process.exit(0);
    }

    // === PostToolUse: Scan generated output for violations ===
    if (hookEvent === 'PostToolUse') {
      let filesToScan = [];

      if (['Write', 'Edit', 'MultiEdit'].includes(toolName)) {
        const paths = getFilePaths(toolName, input.tool_input);
        for (const p of paths) {
          if (SCANNABLE_EXTENSIONS.test(p)) {
            filesToScan.push(path.resolve(p));
          }
        }
      }

      if (toolName === 'Bash') {
        const command = input.tool_input?.command || '';
        const toolResponse = input.tool_response || input.tool_output || {};
        const stdout = toolResponse.stdout || input.stdout || '';
        filesToScan = findOutputFiles(command, stdout, config);
      }

      if (filesToScan.length > 0) {
        const capped = filesToScan.slice(0, config.maxFilesToScan);
        const skipped = filesToScan.length - capped.length;
        const allViolations = [];

        for (const file of capped) {
          const violations = scanFileForViolations(file);
          if (violations.length > 0) {
            allViolations.push({ file: path.relative(process.cwd(), file), violations });
          }
        }

        if (allViolations.length > 0) {
          const lines = ['🚨 Brand violations detected in generated output:'];
          for (const { file, violations } of allViolations) {
            lines.push(`\n  ${file}:`);
            violations.forEach(v => lines.push(`    ⚠ ${v}`));
          }
          if (skipped > 0) {
            lines.push(`\n  (${skipped} additional files not scanned — increase maxFilesToScan in config)`);
          }
          lines.push('\nFix these to match DESIGN.md brand tokens.');

          if (config.mode === 'strict') {
            process.stderr.write(lines.join('\n') + '\n');
            process.exit(2);
          } else {
            console.log(lines.join('\n'));
            process.exit(0);
          }
        }
      }
      process.exit(0);
    }

    // Unknown event — pass through
    process.exit(0);
  } catch (e) {
    process.stderr.write(`brand-compliance hook error: ${e.message}\n`);
    process.exit(0); // fail-open: never block on hook crash
  }
});
