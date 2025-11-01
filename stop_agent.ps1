# 停止Server Monitoring Agent

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  Stopping Server Monitoring Agent" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# 查找所有运行中的Python进程
$pythonProcesses = Get-Process | Where-Object { $_.ProcessName -eq "python" }

if (-Not $pythonProcesses) {
    Write-Host "✓ No Agent is running" -ForegroundColor Green
    exit 0
}

Write-Host "Found Python processes:" -ForegroundColor Yellow
$pythonProcesses | Format-Table Id, ProcessName, StartTime -AutoSize

Write-Host "Stopping all Python processes..." -ForegroundColor Yellow
foreach ($process in $pythonProcesses) {
    try {
        Stop-Process -Id $process.Id -Force
        Write-Host "✓ Stopped process $($process.Id)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to stop process $($process.Id)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# 验证
$remainingProcesses = Get-Process | Where-Object { $_.ProcessName -eq "python" }
if ($remainingProcesses) {
    Write-Host "`n⚠ Some processes are still running" -ForegroundColor Yellow
    $remainingProcesses | Format-Table Id, ProcessName
} else {
    Write-Host "`n✓ All Agent processes stopped successfully" -ForegroundColor Green
}

