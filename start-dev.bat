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

call npm run dev
if errorlevel 1 (
    echo Development server failed to start.
    pause
    exit /b 1
)

endlocal
