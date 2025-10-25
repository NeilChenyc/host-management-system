# JWT功能测试脚本

Write-Host "=== JWT功能测试 ===" -ForegroundColor Cyan

# 1. 登录获取Token
Write-Host "`n1. 登录测试..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ 登录成功" -ForegroundColor Green
    Write-Host "  Username: $($loginResponse.username)"
    Write-Host "  Role: $($loginResponse.role)"
    Write-Host "  Token: $($loginResponse.token.Substring(0,50))..."
    $token = $loginResponse.token
} catch {
    Write-Host "✗ 登录失败: $_" -ForegroundColor Red
    exit
}

# 2. 测试获取项目列表
Write-Host "`n2. 测试获取项目列表 (/api/projects/my)..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $projects = Invoke-RestMethod -Uri "http://localhost:8080/api/projects/my" -Method GET -Headers $headers
    Write-Host "✓ 成功获取项目列表" -ForegroundColor Green
    Write-Host "  项目数量: $($projects.Count)"
    if ($projects.Count -gt 0) {
        Write-Host "  项目列表:"
        $projects | ForEach-Object { Write-Host "    - $($_.name) (ID: $($_.id))" }
    }
} catch {
    Write-Host "✗ 获取项目失败" -ForegroundColor Red
    Write-Host "  错误: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "  详情: $($_.ErrorDetails.Message)"
    }
}

# 3. 测试获取用户列表
Write-Host "`n3. 测试获取用户列表 (/api/users)..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method GET -Headers $headers
    Write-Host "✓ 成功获取用户列表" -ForegroundColor Green
    Write-Host "  用户数量: $($users.Count)"
    if ($users.Count -gt 0) {
        Write-Host "  用户列表:"
        $users | Select-Object -First 5 | ForEach-Object { Write-Host "    - $($_.username) ($($_.role))" }
    }
} catch {
    Write-Host "✗ 获取用户失败" -ForegroundColor Red
    Write-Host "  错误: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "  详情: $($_.ErrorDetails.Message)"
    }
}

# 4. 测试获取服务器列表
Write-Host "`n4. 测试获取服务器列表 (/api/servers)..." -ForegroundColor Yellow
try {
    $servers = Invoke-RestMethod -Uri "http://localhost:8080/api/servers" -Method GET -Headers $headers
    Write-Host "✓ 成功获取服务器列表" -ForegroundColor Green
    Write-Host "  服务器数量: $($servers.Count)"
    if ($servers.Count -gt 0) {
        Write-Host "  服务器列表:"
        $servers | Select-Object -First 5 | ForEach-Object { Write-Host "    - $($_.name) ($($_.ipAddress))" }
    }
} catch {
    Write-Host "✗ 获取服务器失败" -ForegroundColor Red
    Write-Host "  错误: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "  详情: $($_.ErrorDetails.Message)"
    }
}

# 5. 测试获取告警规则
Write-Host "`n5. 测试获取告警规则 (/api/alert-rules)..." -ForegroundColor Yellow
try {
    $alertRules = Invoke-RestMethod -Uri "http://localhost:8080/api/alert-rules" -Method GET -Headers $headers
    Write-Host "✓ 成功获取告警规则" -ForegroundColor Green
    Write-Host "  告警规则数量: $($alertRules.Count)"
    if ($alertRules.Count -gt 0) {
        Write-Host "  告警规则列表:"
        $alertRules | Select-Object -First 5 | ForEach-Object { Write-Host "    - $($_.name)" }
    }
} catch {
    Write-Host "✗ 获取告警规则失败" -ForegroundColor Red
    Write-Host "  错误: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "  详情: $($_.ErrorDetails.Message)"
    }
}

# 6. 测试无Token访问（应该返回401）
Write-Host "`n6. 测试无Token访问（应返回401）..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8080/api/projects/my" -Method GET
    Write-Host "✗ 应该返回401但成功了！" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "✓ 正确返回401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "✗ 返回了错误的状态码: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Cyan

