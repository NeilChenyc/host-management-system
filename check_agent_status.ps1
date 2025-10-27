# Agent状态检查脚本

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Server Monitoring Agent Status" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 检查Python进程
Write-Host "1. Checking Agent Process..." -ForegroundColor Yellow
$agentProcess = Get-Process | Where-Object { $_.ProcessName -eq "python" } | Select-Object -First 1

if ($agentProcess) {
    Write-Host "   ✓ Agent is running (PID: $($agentProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "   ✗ Agent is not running" -ForegroundColor Red
    Write-Host "`nTo start Agent, run:" -ForegroundColor Yellow
    Write-Host "   python server_agent.py" -ForegroundColor White
    exit
}

# 检查后端连接
Write-Host "`n2. Checking Backend Connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✓ Backend is running (HTTP $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Cannot connect to backend" -ForegroundColor Red
    Write-Host "   Make sure Spring Boot is running on port 8080" -ForegroundColor Yellow
}

# 检查最新数据
Write-Host "`n3. Checking Latest Metrics..." -ForegroundColor Yellow
try {
    $metricsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/servers/1/metrics/latest" -Method Get -TimeoutSec 5 -ErrorAction Stop
    
    if ($metricsResponse) {
        Write-Host "   ✓ Latest metrics found:" -ForegroundColor Green
        Write-Host "      Server ID: $($metricsResponse.serverId)" -ForegroundColor White
        Write-Host "      CPU: $($metricsResponse.cpuUsage)%" -ForegroundColor White
        Write-Host "      Memory: $($metricsResponse.memoryUsage)%" -ForegroundColor White
        Write-Host "      Disk: $($metricsResponse.diskUsage)%" -ForegroundColor White
        Write-Host "      Collected: $($metricsResponse.collectedAt)" -ForegroundColor White
    }
} catch {
    Write-Host "   ⚠ No metrics data yet (Agent just started?)" -ForegroundColor Yellow
    Write-Host "   Wait 60 seconds for first collection..." -ForegroundColor Gray
}

# 显示配置
Write-Host "`n4. Agent Configuration:" -ForegroundColor Yellow
try {
    $config = Get-Content "agent_config.json" | ConvertFrom-Json
    Write-Host "   Platform URL: $($config.platform_url)" -ForegroundColor White
    Write-Host "   Server ID: $($config.server_id)" -ForegroundColor White
    Write-Host "   Interval: $($config.interval) seconds" -ForegroundColor White
} catch {
    Write-Host "   ✗ Cannot read config file" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Status check complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "To stop Agent:" -ForegroundColor Yellow
Write-Host "   Get-Process python | Stop-Process" -ForegroundColor White
Write-Host "`nTo view real-time output:" -ForegroundColor Yellow
Write-Host "   python server_agent.py" -ForegroundColor White

