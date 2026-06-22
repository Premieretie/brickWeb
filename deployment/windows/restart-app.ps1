# ============================================================
# BrickQuote Pro — Safely Restart Application
# ============================================================
# Restarts the BrickQuotePro Windows service and recycles the
# IIS application pool. Use this after manual configuration changes
# or when the app needs a soft restart without a full redeploy.
#
# Usage:
#   .\deployment\windows\restart-app.ps1
# ============================================================

param(
    [string]$ServiceName = "BrickQuotePro",
    [string]$Domain = "brickquotepro.com"
)

$ErrorActionPreference = "Stop"

function Write-Header($text) {
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host " $text" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

Import-Module WebAdministration -ErrorAction SilentlyContinue

# ── Restart the Next.js service ───────────────────────────
Write-Header "Restarting $ServiceName"
$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($service) {
    Restart-Service -Name $ServiceName -Force
    Write-Host "$ServiceName restarted successfully." -ForegroundColor Green
} else {
    Write-Warning "Service '$ServiceName' not found. Run install-service.ps1 first."
}

# ── Recycle IIS application pool ──────────────────────────
Write-Header "Recycling IIS application pool '$Domain'"
$pool = Get-Item -Path "IIS:\AppPools\$Domain" -ErrorAction SilentlyContinue
if ($pool) {
    Restart-WebAppPool -Name $Domain
    Write-Host "Application pool '$Domain' recycled successfully." -ForegroundColor Green
} else {
    Write-Warning "Application pool '$Domain' not found."
}

Write-Header "Restart complete"
Write-Host "Verify: https://$Domain/api/health" -ForegroundColor Green
