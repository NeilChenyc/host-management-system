# 启动Server Monitoring Agent

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  Starting Server Monitoring Agent" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# 检查是否已经在运行
$existingProcess = Get-Process | Where-Object { $_.ProcessName -eq "python" -and $_.CommandLine -like "*server_agent*" } | Select-Object -First 1

if ($existingProcess) {
    Write-Host "⚠ Agent is already running (PID: $($existingProcess.Id))" -ForegroundColor Yellow
    Write-Host "`nOptions:" -ForegroundColor White
    Write-Host "  1. Keep it running" -ForegroundColor Gray
    Write-Host "  2. Stop and restart" -ForegroundColor Gray
    
    $choice = Read-Host "`nYour choice (1/2)"
    
    if ($choice -eq "2") {
        Write-Host "Stopping existing Agent..." -ForegroundColor Yellow
        Stop-Process -Id $existingProcess.Id -Force
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Keeping existing Agent running" -ForegroundColor Green
        exit
    }
}

# 检查配置文件
if (-Not (Test-Path "agent_config.json")) {
    Write-Host "✗ Configuration file not found: agent_config.json" -ForegroundColor Red
    Write-Host "Please create agent_config.json first" -ForegroundColor Yellow
    exit 1
}

# 检查Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found" -ForegroundColor Red
    Write-Host "Please install Python 3.8+" -ForegroundColor Yellow
    exit 1
}

# 检查依赖
Write-Host "Checking dependencies..." -ForegroundColor Yellow
try {
    python -c "import psutil, requests" 2>$null
    Write-Host "✓ Dependencies OK (psutil, requests)" -ForegroundColor Green
} catch {
    Write-Host "✗ Missing dependencies" -ForegroundColor Red
    Write-Host "Installing psutil and requests..." -ForegroundColor Yellow
    pip install psutil requests
}

Write-Host "`nStarting Agent..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Gray

# 启动Agent
python server_agent.py

