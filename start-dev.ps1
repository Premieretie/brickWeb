#Requires -Version 5.1

# BrickQuote Pro - Start local development server and wait for it to be ready

param(
    [int]$Port = 3000,
    [string]$Url = "http://localhost:$Port",
    [int]$TimeoutSeconds = 60
)

function Test-ServerReady {
    param([string]$TestUrl)
    try {
        $response = Invoke-WebRequest -Uri $TestUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

function Test-PortListening {
    param([int]$TestPort)
    try {
        $connection = Get-NetTCPConnection -LocalPort $TestPort -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
        return $null -ne $connection
    }
    catch {
        return $false
    }
}

Write-Host "BrickQuote Pro - Development Server Launcher" -ForegroundColor Cyan
Write-Host "Target URL: $Url" -ForegroundColor Gray

# Ensure node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Running npm install..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm install failed. Fix the errors above and try again." -ForegroundColor Red
        exit 1
    }
}

# Check if the server is already running
if (Test-ServerReady -TestUrl $Url) {
    Write-Host "Dev server is already running and ready." -ForegroundColor Green
    Start-Process $Url
    exit 0
}

if (Test-PortListening -TestPort $Port) {
    Write-Host "Port $Port is in use but the site is not responding yet. Waiting..." -ForegroundColor Yellow
}
else {
    Write-Host "Starting Next.js dev server..." -ForegroundColor Cyan
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal
}

# Wait until the server responds
Write-Host "Waiting for $Url to be ready (timeout: ${TimeoutSeconds}s)..." -ForegroundColor Gray
$sw = [System.Diagnostics.Stopwatch]::StartNew()
while ($sw.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
    if (Test-ServerReady -TestUrl $Url) {
        Write-Host "Server is ready! Opening browser..." -ForegroundColor Green
        Start-Process $Url
        exit 0
    }
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline -ForegroundColor Gray
}

Write-Host "`nTimed out waiting for the dev server." -ForegroundColor Red
Write-Host "Check the other PowerShell window for npm errors." -ForegroundColor Yellow
exit 1
