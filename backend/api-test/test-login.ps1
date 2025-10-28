# 测试登录功能的PowerShell脚本

# 测试1: 使用不存在的用户登录
Write-Host "测试1: 使用不存在的用户登录"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" -Method Post -ContentType "application/json" -Body '{"username":"nonexistent","password":"password"}'
    Write-Host "错误: 登录应该失败但成功了!" -ForegroundColor Red
    Write-Host $response
} catch {
    Write-Host "测试1通过: 登录失败 (预期行为)" -ForegroundColor Green
    Write-Host "状态码: $($_.Exception.Response.StatusCode.Value__)"
}

# 等待1秒
Start-Sleep -Seconds 1

# 测试2: 使用正确的用户信息登录（假设数据库中有默认用户）
# 注意: 这个测试可能会失败，因为我们不知道数据库中的实际用户
Write-Host "\n测试2: 使用admin/admin登录"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"admin"}'
    Write-Host "测试2通过: 登录成功" -ForegroundColor Green
    Write-Host "响应:"
    $response | ConvertTo-Json
} catch {
    Write-Host "测试2失败: 登录失败" -ForegroundColor Yellow
    Write-Host "状态码: $($_.Exception.Response.StatusCode.Value__)"
}

# 测试3: 由于之前的实现问题，让我们也测试一下空密码
Write-Host "\n测试3: 使用空密码登录"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":""}'
    Write-Host "错误: 空密码登录应该失败但成功了!" -ForegroundColor Red
    Write-Host $response
} catch {
    Write-Host "测试3通过: 空密码登录失败 (预期行为)" -ForegroundColor Green
    Write-Host "状态码: $($_.Exception.Response.StatusCode.Value__)"
}