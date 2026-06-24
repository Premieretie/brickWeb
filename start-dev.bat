@echo off
REM BrickQuote Pro - Start local development server
REM Delegates to the more reliable PowerShell launcher

powershell -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1"
if errorlevel 1 (
    pause
    exit /b 1
)
