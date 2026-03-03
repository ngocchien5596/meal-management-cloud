# ============================================
# Meal Management System Startup Script (Pure Local)
# ============================================

$ROOT = $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KHOI DONG MEAL MANAGEMENT (LOCAL)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 0. Don dep tien trinh
Write-Host "[0/3] Dang don dep tien trinh & kiem tra Docker..." -ForegroundColor Magenta

# Kill all node.exe/tsx.exe to release locks
Write-Host "  Tat tat ca node.exe/tsx.exe dang chay ngam..." -ForegroundColor Gray
Get-Process -Name "node", "tsx" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue 2>$null

# Wait for processes to fully terminate
Start-Sleep -Seconds 1

# Kill by port (Only 4000 and 3000)
$ports = @(4000, 3000)
foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            if ($processId -and $processId -ne 0) {
                Write-Host "  Giai phong port $port..." -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
    }
    catch {}
}

# 1. Check Docker Container (Database + Redis)
$containerName = "meal-db-new"
$dockerStatus = docker inspect -f '{{.State.Running}}' $containerName 2>$null
if ($dockerStatus -ne "true") {
    Write-Host "⚠️  Database ($containerName) dang tat. Dang khoi dong..." -ForegroundColor Yellow
    docker-compose -f "$ROOT\docker-compose.new-db.yml" up -d
}
else {
    Write-Host "✅ Database & Redis dang hoat dong tot." -ForegroundColor Green
}

# 2. Sync Prisma
Write-Host "[1/3] Dong bo Prisma Client..." -ForegroundColor Magenta
Push-Location "$ROOT\meal-management\apps\api"
npx prisma generate | Out-Null
Pop-Location

Start-Sleep -Seconds 1

# --- KHOI DONG SERVICES ---

# 3. Meal API (Port 4000)
Write-Host "[2/3] Khoi dong Backend (Port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\meal-management\apps\api'; pnpm dev"

Start-Sleep -Seconds 1

# 4. Meal Web (Port 3000)
Write-Host "[3/3] Khoi dong Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\meal-management\apps\web'; pnpm dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DA KHOI DONG XONG CHEDO LOCAL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Truy cap ngay:" -ForegroundColor Cyan
Write-Host "  - Frontend:     http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend API:  http://localhost:4000/api" -ForegroundColor White
Write-Host ""
Write-Host "Ghi chu: Hay dam bao .env da set ve localhost." -ForegroundColor Gray
Write-Host ""
