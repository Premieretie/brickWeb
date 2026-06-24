@echo off
setlocal

REM BrickQuote Pro - Start local development server
REM Requires Node.js and npm to be installed

echo Starting BrickQuote Pro local development server...

if not exist "node_modules" (
    echo node_modules not found. Running npm install...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo npm install failed.
        pause
        exit /b 1
    )
)

REM Check if the dev server is already running on port 3000
powershell -Command "(Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue) -ne $null" >nul 2>&1
if %errorlevel% == 0 (
    echo Dev server is already running on http://localhost:3000
    start http://localhost:3000
    exit /b 0
)

REM Start the Next.js dev server in a separate window so this script can continue
echo Launching Next.js dev server...
start "Next.js Dev Server" cmd /c "npm run dev"

REM Wait for the server to initialize
setlocal enabledelayedexpansion
set /a counter=5
echo Waiting %counter% seconds for the dev server to start...
timeout /t %counter% /nobreak >nul

REM Open the browser
echo Opening http://localhost:3000...
start http://localhost:3000

endlocal
endlocal
