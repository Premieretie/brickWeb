# ============================================================
# BrickQuote Pro — Create the BrickQuotePro Windows Service
# ============================================================
# Creates a Windows service that runs the Next.js standalone
# application using nssm (the Non-Sucking Service Manager).
#
# Usage:
#   .\deployment\windows\install-service.ps1
#
# Requires:
#   - nssm.exe installed at C:\Windows\nssm.exe (done by server setup)
#   - Next.js standalone build extracted to C:\inetpub\brickquotepro\site
# ============================================================

param(
    [string]$AppDir = "C:\inetpub\brickquotepro\site",
    [string]$ServiceName = "BrickQuotePro",
    [string]$DisplayName = "BrickQuote Pro Next.js",
    [string]$LogDir = "C:\inetpub\logs\brickquotepro"
)

$ErrorActionPreference = "Stop"

function Write-Header($text) {
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host " $text" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

# ── Validate nssm is installed ────────────────────────────
$nssm = "$env:WINDIR\nssm.exe"
if (-not (Test-Path $nssm)) {
    throw "nssm.exe not found at $nssm. Install it via the server setup guide."
}

# ── Validate app exists ──────────────────────────────────
$serverJs = "$AppDir\server.js"
if (-not (Test-Path $serverJs)) {
    throw "Next.js standalone server.js not found at $serverJs. Deploy the app first."
}

# ── Ensure log directory exists ───────────────────────────
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# ── Remove existing service if present ────────────────────
Write-Header "Installing $ServiceName Windows service"
$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "Removing existing service..." -ForegroundColor Yellow
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    & $nssm remove $ServiceName confirm
}

# ── Install the service ───────────────────────────────────
$nodeExe = "$env:ProgramFiles\nodejs\node.exe"
if (-not (Test-Path $nodeExe)) {
    $nodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
    if (-not $nodeExe) {
        throw "Node.js executable not found."
    }
}

& $nssm install $ServiceName "$nodeExe" "$serverJs"
& $nssm set $ServiceName DisplayName "$DisplayName"
& $nssm set $ServiceName Description "Next.js App Router for brickquotepro.com"
& $nssm set $ServiceName Directory $AppDir
& $nssm set $ServiceName AppEnvironmentExtra NODE_ENV=production
& $nssm set $ServiceName Start SERVICE_AUTO_START

# ── Configure logging ─────────────────────────────────────
& $nssm set $ServiceName AppStdout "$LogDir\stdout.log"
& $nssm set $ServiceName AppStderr "$LogDir\stderr.log"
& $nssm set $ServiceName AppStdoutCreationDisposition 2
& $nssm set $ServiceName AppStderrCreationDisposition 2
& $nssm set $ServiceName AppRotateFiles 1
& $nssm set $ServiceName AppRotateBytes 10485760

# ── Start the service ─────────────────────────────────────
Start-Service -Name $ServiceName

Write-Header "Service installed and started"
Write-Host "Verify: Get-Service $ServiceName" -ForegroundColor Green
Write-Host "Logs:   $LogDir" -ForegroundColor Green
