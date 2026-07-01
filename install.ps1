# Perficient Brand Compliance Hook — Installer (Windows PowerShell)
# Usage: .\install.ps1 [-Target <directory>] [-Strict]
#
# Installs the brand compliance hook + DESIGN.md into a target project.
# If no target is specified, installs into the current directory.
# Pass -Strict to enable blocking mode (violations prevent writes).

param(
    [string]$Target = ".",
    [switch]$Strict
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Target = Resolve-Path $Target

# Check Node.js
try {
    $null = Get-Command node -ErrorAction Stop
} catch {
    Write-Host "✗ Node.js is required but not found on PATH." -ForegroundColor Red
    Write-Host "  Claude Code requires Node.js — install it first."
    exit 1
}

$modeLabel = if ($Strict) { "strict (blocking)" } else { "warn (advisory)" }
Write-Host "🎨 Perficient Brand Compliance Hook Installer" -ForegroundColor Cyan
Write-Host "   Target: $Target"
Write-Host "   Mode:   $modeLabel"
Write-Host ""

# 1. Create .claude\hooks\ in target
$HooksDir = Join-Path $Target ".claude\hooks"
if (-not (Test-Path $HooksDir)) {
    New-Item -ItemType Directory -Path $HooksDir -Force | Out-Null
}

# 2. Copy hook script
Copy-Item (Join-Path $ScriptDir ".claude\hooks\brand-compliance.js") (Join-Path $HooksDir "brand-compliance.js") -Force
Write-Host "✓ Copied brand-compliance.js" -ForegroundColor Green

# 3. Copy config (set mode based on -Strict flag)
$ConfigSource = Join-Path $ScriptDir ".claude\hooks\brand-compliance.config.json"
$ConfigDest = Join-Path $HooksDir "brand-compliance.config.json"
if ($Strict) {
    $config = Get-Content $ConfigSource -Raw | ConvertFrom-Json
    $config.mode = "strict"
    $config | ConvertTo-Json -Depth 5 | Set-Content $ConfigDest -Encoding UTF8
} else {
    Copy-Item $ConfigSource $ConfigDest -Force
}
$modeStr = if ($Strict) { "strict" } else { "warn" }
Write-Host "✓ Copied brand-compliance.config.json (mode: $modeStr)" -ForegroundColor Green

# 4. Merge or create settings.json
$SettingsPath = Join-Path $Target ".claude\settings.json"
if (Test-Path $SettingsPath) {
    $settings = Get-Content $SettingsPath -Raw | ConvertFrom-Json

    if (-not $settings.hooks) {
        $settings | Add-Member -NotePropertyName "hooks" -NotePropertyValue @{} -Force
    }

    function Test-HookInstalled($arr) {
        foreach ($entry in $arr) {
            foreach ($hook in $entry.hooks) {
                if ($hook.command -and $hook.command -like "*brand-compliance.js*") {
                    return $true
                }
            }
        }
        return $false
    }

    $hookEntryPre = @{ matcher = "Write|Edit|MultiEdit|Bash"; hooks = @(@{ type = "command"; command = "node .claude/hooks/brand-compliance.js"; timeout = 3 }) }
    $hookEntryPost = @{ matcher = "Write|Edit|MultiEdit|Bash"; hooks = @(@{ type = "command"; command = "node .claude/hooks/brand-compliance.js"; timeout = 5 }) }

    if (-not $settings.hooks.PreToolUse) {
        $settings.hooks | Add-Member -NotePropertyName "PreToolUse" -NotePropertyValue @() -Force
    }
    if (-not (Test-HookInstalled $settings.hooks.PreToolUse)) {
        $settings.hooks.PreToolUse += $hookEntryPre
    }

    if (-not $settings.hooks.PostToolUse) {
        $settings.hooks | Add-Member -NotePropertyName "PostToolUse" -NotePropertyValue @() -Force
    }
    if (-not (Test-HookInstalled $settings.hooks.PostToolUse)) {
        $settings.hooks.PostToolUse += $hookEntryPost
    }

    $settings | ConvertTo-Json -Depth 10 | Set-Content $SettingsPath -Encoding UTF8
    Write-Host "✓ Merged hooks into existing settings.json" -ForegroundColor Green
} else {
    Copy-Item (Join-Path $ScriptDir ".claude\settings.json") $SettingsPath -Force
    Write-Host "✓ Created settings.json" -ForegroundColor Green
}

# 5. Copy DESIGN.md if not present
$DesignDest = Join-Path $Target "DESIGN.md"
if (-not (Test-Path $DesignDest)) {
    $DesignSource = Join-Path $ScriptDir "DESIGN.md"
    if (Test-Path $DesignSource) {
        Copy-Item $DesignSource $DesignDest
        Write-Host "✓ Copied DESIGN.md" -ForegroundColor Green
    } else {
        Write-Host "⚠ DESIGN.md not found in installer directory — skipping" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ DESIGN.md already exists (skipped)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done! Brand compliance hook is active." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Warn mode:   Claude sees reminders, writes proceed normally"
Write-Host "  Strict mode:  Violations block writes until fixed"
Write-Host ""
Write-Host "  Toggle: edit .claude\hooks\brand-compliance.config.json → `"mode`": `"strict`"|`"warn`""
