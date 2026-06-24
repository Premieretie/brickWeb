@echo off
REM ============================================================
REM  BrickQuote Pro - 502 Diagnostic Launcher
REM ============================================================
REM  Run as Administrator on the production server to find out
REM  why the site returns a 502 Bad Gateway.
REM ============================================================

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Run this as Administrator.
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\deployment\windows\diagnose.ps1"
echo.
pause
