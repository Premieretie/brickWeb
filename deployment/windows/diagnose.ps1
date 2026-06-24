# ============================================================
# BrickQuote Pro - 502 Diagnostic
# ============================================================
# Diagnoses why the origin returns a 502 Bad Gateway.
# Checks the Windows service, the Node listener on port 3000,
# the environment file, IIS site/app pool, and recent error logs.
#
# Usage (run as Administrator on the production server):
#   .\deployment\windows\diagnose.ps1
# ============================================================

param(
    [string]$AppDir = "C:\inetpub\brickquotepro\site",
    [string]$DeployDir = "C:\inetpub\brickquotepro",
    [string]$LogDir = "C:\inetpub\logs\brickquotepro",
    [string]$ServiceName = "BrickQuotePro",
    [int]$Port = 3000,
    [string]$Domain = "brickquotepro.com"
)

function Write-Header($text) {
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host " $text" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Ok($m)   { Write-Host "[OK]   $m" -ForegroundColor Green }
function Warn($m) { Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Bad($m)  { Write-Host "[FAIL] $m" -ForegroundColor Red }

# ── 1. Windows service ─────────────────────────────────────
Write-Header "1. Windows service: $ServiceName"
$svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if (-not $svc) {
    Bad "Service '$ServiceName' does not exist. Run install-service.ps1."
} elseif ($svc.Status -ne 'Running') {
    Bad "Service exists but status is '$($svc.Status)'. It should be 'Running'."
    Write-Host "      Try: Start-Service $ServiceName" -ForegroundColor Gray
} else {
    Ok "Service is running."
}

# ── 2. Node listener on the proxy port ─────────────────────
Write-Header "2. Node listener on 127.0.0.1:$Port"
$conn = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if (-not $conn) {
    Bad "Nothing is listening on port $Port. The Node app is not running or crashed."
} else {
    Ok "Port $Port is listening (PID $($conn[0].OwningProcess))."
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/api/health" -UseBasicParsing -TimeoutSec 10
        Ok "Local health check returned HTTP $($r.StatusCode)."
    } catch {
        Bad "Local health check failed: $($_.Exception.Message)"
    }
}

# ── 3. Standalone build present ────────────────────────────
Write-Header "3. Standalone build"
if (Test-Path "$AppDir\server.js") {
    Ok "server.js found at $AppDir."
} else {
    Bad "server.js NOT found at $AppDir. Deploy the build (go-live.bat)."
}

# ── 4. Environment file ────────────────────────────────────
Write-Header "4. Environment file"
$envLocal = "$AppDir\.env.local"
$envSource = "$DeployDir\.env"
if (Test-Path $envLocal) {
    Ok ".env.local present in app directory."
} elseif (Test-Path $envSource) {
    Warn ".env exists at $envSource but was not copied to $envLocal."
} else {
    Bad "No environment file found. The app may crash on startup."
}

if (Test-Path $envLocal) {
    $required = @('NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY')
    $content = Get-Content $envLocal -Raw
    foreach ($key in $required) {
        if ($content -match "(?m)^\s*$key\s*=\s*\S") { Ok "$key is set." }
        else { Bad "$key is missing or empty." }
    }
}

# ── 5. IIS site + app pool ─────────────────────────────────
Write-Header "5. IIS site and application pool"
Import-Module WebAdministration -ErrorAction SilentlyContinue
$pool = Get-Item "IIS:\AppPools\$Domain" -ErrorAction SilentlyContinue
if ($pool) {
    if ($pool.state -eq 'Started') { Ok "App pool '$Domain' is started." }
    else { Bad "App pool '$Domain' state is '$($pool.state)'." }
} else {
    Warn "App pool '$Domain' not found (name may differ)."
}

# ── 6. ARR proxy enabled ───────────────────────────────────
Write-Header "6. Application Request Routing (ARR) proxy"
try {
    $arr = Get-WebConfigurationProperty -PSPath 'MACHINE/WEBROOT/APPHOST' `
        -Filter 'system.webServer/proxy' -Name 'enabled' -ErrorAction Stop
    if ($arr.Value) { Ok "ARR proxy is enabled." }
    else { Bad "ARR proxy is DISABLED. Enable it in IIS > Application Request Routing Cache > Server Proxy Settings." }
} catch {
    Warn "Could not read ARR proxy setting. Ensure ARR 3.0 is installed."
}

# ── 7. Recent error logs ───────────────────────────────────
Write-Header "7. Recent service error log (last 20 lines)"
$stderr = "$LogDir\stderr.log"
if (Test-Path $stderr) {
    Get-Content $stderr -Tail 20
} else {
    Warn "No stderr log found at $stderr."
}

Write-Header "Diagnosis complete"
Write-Host "Most common 502 cause: the Node service is stopped/crashed (see sections 1, 2, 7)." -ForegroundColor Gray
