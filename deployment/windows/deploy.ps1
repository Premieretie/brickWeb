# ============================================================
# BrickQuote Pro — Deploy to Windows Server (IIS + Next.js)
# ============================================================
# Run on the production Windows Server to deploy a new build.
# The script backs up the current app, extracts the new build,
# copies environment variables and IIS web.config, recycles the
# IIS application pool, and starts the BrickQuotePro service.
#
# Usage:
#   .\deployment\windows\deploy.ps1 -ArtifactPath C:\temp\brickquotepro-standalone.zip
#
# Prerequisite:
#   - IIS site + application pool created (see windows-server-setup.md)
#   - Windows service created (see install-service.ps1)
#   - Environment file at C:\inetpub\brickquotepro\.env
#   - web.config at C:\inetpub\brickquotepro\web.config
# ============================================================

param(
    [Parameter(Mandatory = $true)]
    [string]$ArtifactPath,

    [string]$AppDir = "C:\inetpub\brickquotepro\site",
    [string]$DeployDir = "C:\inetpub\brickquotepro",
    [string]$BackupDir = "C:\inetpub\brickquotepro\backups",
    [string]$ServiceName = "BrickQuotePro",
    [string]$Domain = "brickquotepro.com"
)

$ErrorActionPreference = "Stop"

function Write-Header($text) {
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host " $text" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

# ── Validate inputs ────────────────────────────────────────
if (-not (Test-Path $ArtifactPath)) {
    throw "Artifact not found: $ArtifactPath"
}

Import-Module WebAdministration -ErrorAction SilentlyContinue

# ── 1. Stop the Next.js service ───────────────────────────
Write-Header "Stopping $ServiceName"
$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($service -and $service.Status -ne 'Stopped') {
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
}

# ── 2. Backup current deployment ──────────────────────────
if (Test-Path $AppDir) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backup = "$BackupDir\$timestamp"
    New-Item -ItemType Directory -Path $backup -Force | Out-Null
    Write-Header "Backing up current app to $backup"
    Copy-Item -Path "$AppDir\*" -Destination $backup -Recurse -Force -ErrorAction SilentlyContinue
}

# ── 3. Clean and extract new build ───────────────────────
Write-Header "Extracting build to $AppDir"
if (-not (Test-Path $AppDir)) {
    New-Item -ItemType Directory -Path $AppDir -Force | Out-Null
}

Get-ChildItem -Path $AppDir -Recurse -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $ArtifactPath -DestinationPath $AppDir -Force

# ── 4. Copy environment file ───────────────────────────────
$envSource = "$DeployDir\.env"
$envTarget = "$AppDir\.env.local"
if (Test-Path $envSource) {
    Write-Header "Copying environment file"
    Copy-Item -Path $envSource -Destination $envTarget -Force
} else {
    Write-Warning "Environment file not found at $envSource — ensure it exists before the service starts."
}

# ── 5. Copy IIS web.config ────────────────────────────────
$webConfigSource = "$DeployDir\web.config"
if (Test-Path $webConfigSource) {
    Write-Header "Copying IIS web.config"
    Copy-Item -Path $webConfigSource -Destination "$AppDir\web.config" -Force
} else {
    Write-Warning "web.config not found at $webConfigSource"
}

# ── 6. Create the Windows service if missing ──────────────
$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if (-not $service) {
    Write-Header "Service not found — creating $ServiceName"
    $installServiceScript = "$PSScriptRoot\install-service.ps1"
    if (Test-Path $installServiceScript) {
        & $installServiceScript -AppDir $AppDir -ServiceName $ServiceName
    } else {
        throw "install-service.ps1 not found at $installServiceScript"
    }
}

# ── 7. Start the Next.js service ──────────────────────────
Write-Header "Starting $ServiceName"
Start-Service -Name $ServiceName

# ── 8. Recycle IIS application pool ────────────────────────
Write-Header "Recycling IIS application pool"
$pool = Get-Item -Path "IIS:\AppPools\$Domain" -ErrorAction SilentlyContinue
if ($pool) {
    Restart-WebAppPool -Name $Domain
} else {
    Write-Warning "Application pool '$Domain' not found — recycle manually if needed."
}

Write-Header "Deployment complete"
Write-Host "Verify: https://$Domain/api/health" -ForegroundColor Green
