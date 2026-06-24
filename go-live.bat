@echo off
REM ============================================================
REM  BrickQuote Pro - Go Live (Production Deployment)
REM ============================================================
REM  One-click production deployment for Windows Server.
REM  Builds the Next.js standalone app, packages it, deploys it
REM  to IIS, and starts the BrickQuotePro Windows service.
REM
REM  Usage (run as Administrator on the production server):
REM    go-live.bat
REM
REM  Steps performed:
REM    1. Build + package standalone artifact (build-app.ps1)
REM    2. Deploy artifact + start service (deploy.ps1)
REM    3. Verify the /api/health endpoint
REM ============================================================

setlocal enabledelayedexpansion

REM --- Resolve paths relative to this script ------------------
set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
set "WINDIR_SCRIPTS=%ROOT%\deployment\windows"
set "ARTIFACT=%ROOT%\deployment\artifacts\brickquotepro-standalone.zip"
set "DOMAIN=brickquotepro.com"

echo.
echo ============================================================
echo  BrickQuote Pro - Production Deployment
echo ============================================================
echo  Root:     %ROOT%
echo  Artifact: %ARTIFACT%
echo  Domain:   %DOMAIN%
echo ============================================================
echo.

REM --- Confirm administrator privileges -----------------------
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This script must be run as Administrator.
    echo         Right-click go-live.bat and choose "Run as administrator".
    goto :fail
)

REM --- Verify PowerShell is available --------------------------
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PowerShell was not found in PATH.
    goto :fail
)

REM --- Step 1: Build + package --------------------------------
echo.
echo [1/3] Building and packaging the production app...
echo ------------------------------------------------------------
powershell -NoProfile -ExecutionPolicy Bypass -File "%WINDIR_SCRIPTS%\build-app.ps1"
if %errorlevel% neq 0 (
    echo [ERROR] Build step failed.
    goto :fail
)

if not exist "%ARTIFACT%" (
    echo [ERROR] Build artifact not found at %ARTIFACT%
    goto :fail
)

REM --- Step 2: Deploy + start service -------------------------
echo.
echo [2/3] Deploying the build to IIS and starting the service...
echo ------------------------------------------------------------
powershell -NoProfile -ExecutionPolicy Bypass -File "%WINDIR_SCRIPTS%\deploy.ps1" -ArtifactPath "%ARTIFACT%" -Domain "%DOMAIN%"
if %errorlevel% neq 0 (
    echo [ERROR] Deployment step failed.
    goto :fail
)

REM --- Step 3: Verify health endpoint -------------------------
echo.
echo [3/3] Verifying the site is live...
echo ------------------------------------------------------------
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -Uri 'https://%DOMAIN%/api/health' -UseBasicParsing -TimeoutSec 30; if ($r.StatusCode -eq 200) { Write-Host '[OK] Site is live (HTTP 200)' -ForegroundColor Green; exit 0 } else { Write-Host ('[WARN] Health check returned HTTP ' + $r.StatusCode) -ForegroundColor Yellow; exit 1 } } catch { Write-Host ('[WARN] Health check failed: ' + $_.Exception.Message) -ForegroundColor Yellow; exit 1 }"
if %errorlevel% neq 0 (
    echo.
    echo [WARN] The deployment completed but the health check did not pass.
    echo        Check the service logs at C:\inetpub\logs\brickquotepro
    echo        and verify DNS / SSL configuration.
)

echo.
echo ============================================================
echo  DEPLOYMENT COMPLETE
echo ============================================================
echo  Site:   https://%DOMAIN%
echo  Health: https://%DOMAIN%/api/health
echo ============================================================
echo.
endlocal
exit /b 0

:fail
echo.
echo ============================================================
echo  DEPLOYMENT FAILED - see messages above
echo ============================================================
echo.
endlocal
exit /b 1
