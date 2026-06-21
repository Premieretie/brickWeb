@echo off
echo Restarting BrickQuote Pro server on port 8090...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$conn = Get-NetTCPConnection -LocalPort 8090 | Where-Object { $_.State -eq 'Listen' } | Select-Object -First 1; if ($conn) { Write-Host ('Stopping existing server PID ' + $conn.OwningProcess); Stop-Process -Id $conn.OwningProcess -Force } else { Write-Host 'No server found on port 8090' }"

echo Starting server...
node "%~dp0server.js"
