# API测试脚本

# 设置错误处理
$ErrorActionPreference = 'Stop'

Write-Host "=== 测试 signin 和 login API ===" -ForegroundColor Green

# 测试1: 调用signin端点 (需要用户名和密码)
Write-Host "\n测试1: 调用 /api/auth/signin 端点 (使用不存在的用户)"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" `
                                 -Method Post `
                                 -ContentType "application/json" `
                                 -Body '{"username":"testuser","password":"testpass"}' `
                                 -UseBasicParsing
    Write-Host "响应状态: 成功"
    Write-Host "响应内容:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "响应状态: 失败 (预期行为)" -ForegroundColor Yellow
    Write-Host "状态码: $($_.Exception.Response.StatusCode.Value__)"
    $errorContent = $_.Exception.Response.GetResponseStream() | Get-Content -Encoding utf8
    Write-Host "错误内容: $errorContent"
}

# 测试2: 调用login端点 (无参数)
Write-Host "\n测试2: 调用 /api/auth/login 端点 (不需要参数)"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
                                 -Method Post `
                                 -UseBasicParsing
    Write-Host "响应状态: 成功"
    Write-Host "响应内容:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "响应状态: 失败" -ForegroundColor Red
    Write-Host "状态码: $($_.Exception.Response.StatusCode.Value__)"
    $errorContent = $_.Exception.Response.GetResponseStream() | Get-Content -Encoding utf8
    Write-Host "错误内容: $errorContent"
}

# 测试3: 尝试注册新用户
Write-Host "\n测试3: 调用 /api/auth/signup 端点 (注册新用户)"
try {
    # 生成随机用户名和邮箱以避免冲突
    $randomId = Get-Random -Minimum 1000 -Maximum 9999
    $username = "testuser$randomId"
    $email = "test$randomId@example.com"
    
    $body = @{"username"=$username;"email"=$email;"password"="TestPass123"} | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signup" `
                                 -Method Post `
                                 -ContentType "application/json" `
                                 -Body $body `
                                 -UseBasicParsing
    Write-Host "响应状态: 成功"
    Write-Host "注册的用户信息:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    # 测试4: 使用刚注册的用户调用signin
    Write-Host "\n测试4: 使用刚注册的用户调用 /api/auth/signin"
    try {
        $loginBody = @{"username"=$username;"password"="TestPass123"} | ConvertTo-Json
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" `
                                          -Method Post `
                                          -ContentType "application/json" `
                                          -Body $loginBody `
                                          -UseBasicParsing
        Write-Host "响应状态: 成功"
        Write-Host "登录响应内容:" -ForegroundColor Cyan
        $loginResponse | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "响应状态: 失败" -ForegroundColor Red
        Write-Host "状态码: $($_.Exception.Response.StatusCode.Value__)"
        $errorContent = $_.Exception.Response.GetResponseStream() | Get-Content -Encoding utf8
        Write-Host "错误内容: $errorContent"
    }
    
} catch {
    Write-Host "响应状态: 失败" -ForegroundColor Red
    Write-Host "状态码: $($_.Exception.Response.StatusCode.Value__)"
    $errorContent = $_.Exception.Response.GetResponseStream() | Get-Content -Encoding utf8
    Write-Host "错误内容: $errorContent"
}

Write-Host "\n=== 测试完成 ===" -ForegroundColor Green
Write-Host "总结:"
Write-Host "- /api/auth/signin: 需要用户名和密码，会进行实际的用户验证"
Write-Host "- /api/auth/login: 不需要任何参数，总是返回成功响应（没有实际验证功能）"
Write-Host "- /api/auth/signup: 用于注册新用户"