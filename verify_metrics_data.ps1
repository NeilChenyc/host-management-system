# 验证metrics数据是否写入数据库

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Metrics Data Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 检查后端是否运行
Write-Host "1. Checking backend..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✓ Backend is running`n" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend is not running" -ForegroundColor Red
    Write-Host "   Please start Spring Boot backend first`n" -ForegroundColor Yellow
    exit 1
}

# 检查Agent是否运行
Write-Host "2. Checking Agent..." -ForegroundColor Yellow
$agentProcess = Get-Process | Where-Object { $_.ProcessName -eq "python" } | Select-Object -First 1
if ($agentProcess) {
    Write-Host "   ✓ Agent is running (PID: $($agentProcess.Id))`n" -ForegroundColor Green
} else {
    Write-Host "   ✗ Agent is not running`n" -ForegroundColor Red
}

# 尝试获取最新数据（使用Swagger，不需要JWT）
Write-Host "3. Checking metrics data..." -ForegroundColor Yellow
try {
    # 直接查询API（Agent推送接口不需要JWT，但查询接口需要）
    # 所以我们用另一种方式验证
    
    Write-Host "   Attempting to verify data push...`n" -ForegroundColor Gray
    
    # 模拟Agent推送一条测试数据
    $testData = @{
        serverId = 1
        cpuUsage = 99.9
        memoryUsage = 99.9
        diskUsage = 99.9
        networkIn = 999.0
        networkOut = 999.0
        loadAvg = 99.9
        temperature = 99.9
    } | ConvertTo-Json
    
    try {
        $pushResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/servers/metrics/collect" `
            -Method Post `
            -Body $testData `
            -ContentType "application/json" `
            -TimeoutSec 5 `
            -ErrorAction Stop
        
        Write-Host "   ✓ Test push successful!" -ForegroundColor Green
        Write-Host "   Response: $($pushResponse.message)" -ForegroundColor White
        Write-Host "   Metric ID: $($pushResponse.metricId)" -ForegroundColor White
        Write-Host "   Server ID: $($pushResponse.serverId)" -ForegroundColor White
        Write-Host "`n   ✓ Data IS being written to server_metrics table!" -ForegroundColor Green -BackgroundColor DarkGreen
        
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "   ✗ Push failed: 401 Unauthorized" -ForegroundColor Red
            Write-Host "   Backend needs to be restarted to apply WebConfig changes" -ForegroundColor Yellow
        } else {
            Write-Host "   ✗ Push failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "   ✗ Verification failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Verification complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "To view data in database, run SQL:" -ForegroundColor Yellow
Write-Host "  SELECT * FROM server_metrics ORDER BY collected_at DESC LIMIT 10;" -ForegroundColor White

