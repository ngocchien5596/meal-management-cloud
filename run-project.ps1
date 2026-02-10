# ============================================
# Meal Management System Startup Script
# ============================================

$ROOT = $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KHOI DONG MEAL MANAGEMENT SYSTEM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 0. Don dep tien trinh
Write-Host "[0/4] Dang don dep tien trinh & kiem tra Docker..." -ForegroundColor Magenta

# Kill all node.exe/tsx.exe to release locks
Write-Host "  Tat tat ca node.exe/tsx.exe..." -ForegroundColor Gray
Get-Process -Name "node", "tsx" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue 2>$null

# Wait for processes to fully terminate
Start-Sleep -Seconds 2

# Kill by port (Only 4000 and 3000)
$ports = @(4000, 3000)
foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            if ($processId -and $processId -ne 0) {
                Write-Host "  Stopping process on port $port..." -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
    }
    catch {}
}

# 1. Check Docker Container
$containerName = "meal-db-new"
$dockerStatus = docker inspect -f '{{.State.Running}}' $containerName 2>$null
if ($dockerStatus -ne "true") {
    Write-Host "⚠️  Container $containerName is not running. Starting it now..." -ForegroundColor Yellow
    docker-compose -f docker-compose.new-db.yml up -d
}
else {
    Write-Host "✅ Database container is running." -ForegroundColor Green
}

# 2. Regenerate Prisma Clients
Write-Host "[1/4] Dang cap nhat Prisma Client..." -ForegroundColor Magenta
Push-Location "$ROOT\meal-management\apps\api"
npx prisma generate | Out-Null
Pop-Location

Start-Sleep -Seconds 1

# --- KHOI DONG SERVICES ---

# 3. Meal API (Port 4000)
Write-Host "[2/4] Khoi dong Meal Management API (Port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\meal-management\apps\api'; pnpm dev"

Start-Sleep -Seconds 2

# 4. Meal Web (Port 3000)
Write-Host "[3/4] Khoi dong Meal Management Web (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\meal-management\apps\web'; pnpm dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DA KHOI DONG XONG!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Truy cap:" -ForegroundColor Cyan
Write-Host "  - Handheld/Web:     http://localhost:3000" -ForegroundColor White
Write-Host "  - API Health:       http://localhost:4000/health" -ForegroundColor White
Write-Host ""
Write-Host "Ghi chu: Moi ung dung chay trong mot cua so PowerShell rieng biet." -ForegroundColor Gray
Write-Host ""
