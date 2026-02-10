# ===============================
# DEV START SCRIPT
# Meal Management System
# ===============================

Write-Host "=== Starting BE ===" -ForegroundColor Cyan
Start-Process powershell -ArgumentList `
    '-NoExit',
    '-Command',
    'cd g:\Source-code\QLSA\meal-management\apps\api; pnpm dev'

Start-Sleep -Seconds 2

Write-Host "=== Starting FE ===" -ForegroundColor Green
Start-Process powershell -ArgumentList `
    '-NoExit',
    '-Command',
    'cd g:\Source-code\QLSA\meal-management\apps\web; pnpm dev'

Start-Sleep -Seconds 3

Write-Host "=== Starting ngrok ===" -ForegroundColor Yellow
Start-Process powershell -ArgumentList `
    '-NoExit',
    '-Command',
    'ngrok http 3000'

Write-Host "=== ALL SERVICES STARTED ===" -ForegroundColor Magenta
