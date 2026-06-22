# ============================================================
# BrickQuote Pro — Build Next.js for Windows Server Deployment
# ============================================================
# Run on the build agent (Windows Server or CI) to install
# dependencies, build the production Next.js app, and package the
# standalone output into a zip ready for deployment.
#
# Usage:
#   .\deployment\windows\build-app.ps1
#
# Output:
#   deployment\artifacts\brickquotepro-standalone.zip
# ============================================================

param(
    [string]$RootDir = (Resolve-Path "$PSScriptRoot\..\.."),
    [string]$ArtifactsDir = "$PSScriptRoot\..\artifacts"
)

$ErrorActionPreference = "Stop"

function Write-Header($text) {
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host " $text" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

# ── Verify Node.js is available ────────────────────────────
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is not in PATH. Install Node.js LTS first."
}

$nodeVersion = node --version
Write-Header "Node.js version: $nodeVersion"

# ── Ensure artifacts directory exists ─────────────────────
if (-not (Test-Path $ArtifactsDir)) {
    New-Item -ItemType Directory -Path $ArtifactsDir -Force | Out-Null
}

# ── Install dependencies ────────────────────────────────────
Write-Header "Installing npm dependencies"
Set-Location $RootDir
npm ci --legacy-peer-deps

# ── Build Next.js standalone output ───────────────────────
Write-Header "Building Next.js production app"
$env:NODE_ENV = "production"
$env:NEXT_TELEMETRY_DISABLED = "1"

# Build-time public variables can be injected here or set as system env vars
npm run build

if ($LASTEXITCODE -ne 0) {
    throw "Next.js build failed with exit code $LASTEXITCODE"
}

# ── Validate standalone output ────────────────────────────
$standaloneDir = "$RootDir\.next\standalone"
if (-not (Test-Path "$standaloneDir\server.js")) {
    throw "Standalone build output not found at $standaloneDir\server.js"
}

# ── Package standalone output ─────────────────────────────
Write-Header "Packaging standalone build"
$artifactName = "brickquotepro-standalone"
$zipPath = "$ArtifactsDir\$artifactName.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Set-Location $standaloneDir
Compress-Archive -Path * -DestinationPath $zipPath -Force
Set-Location $RootDir

Write-Header "Build complete"
Write-Host "Artifact: $zipPath" -ForegroundColor Green
Write-Host "Size:     $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB" -ForegroundColor Green
