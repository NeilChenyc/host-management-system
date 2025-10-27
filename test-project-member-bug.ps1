# 测试项目成员管理的bug
$BASE_URL = "http://localhost:8080/api"

Write-Host "=== 测试项目成员管理功能 ===" -ForegroundColor Cyan

# 1. 登录获取Admin token
Write-Host "`n1. 登录为Admin..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/signin" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
$token = $loginResponse.token
Write-Host "Token获取成功: $($token.Substring(0,20))..." -ForegroundColor Green

# 2. 创建测试项目
Write-Host "`n2. 创建测试项目..." -ForegroundColor Yellow
try {
    $projectData = @{
        name = "Test Member Project"
        description = "测试成员管理"
        status = "ACTIVE"
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $project = Invoke-RestMethod -Uri "$BASE_URL/projects" -Method Post -Headers $headers -Body $projectData
    $projectId = $project.id
    Write-Host "项目创建成功，ID: $projectId" -ForegroundColor Green
} catch {
    Write-Host "创建项目失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "响应内容: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# 3. 测试添加成员
Write-Host "`n3. 测试添加成员（用户ID: 2, 3）..." -ForegroundColor Yellow
try {
    $memberData = @(2, 3) | ConvertTo-Json
    
    Write-Host "请求URL: $BASE_URL/projects/$projectId/members" -ForegroundColor Gray
    Write-Host "请求Body: $memberData" -ForegroundColor Gray
    
    $addResult = Invoke-RestMethod -Uri "$BASE_URL/projects/$projectId/members" -Method Post -Headers $headers -Body $memberData
    Write-Host "添加成员成功！" -ForegroundColor Green
    Write-Host "返回结果: $($addResult | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "添加成员失败！" -ForegroundColor Red
    Write-Host "错误信息: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "详细错误: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host "状态码: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# 4. 查看项目成员
Write-Host "`n4. 查看项目成员..." -ForegroundColor Yellow
try {
    $members = Invoke-RestMethod -Uri "$BASE_URL/projects/$projectId/members" -Method Get -Headers $headers
    Write-Host "当前项目成员: $($members -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "查看成员失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. 测试删除成员
Write-Host "`n5. 测试删除成员（用户ID: 2）..." -ForegroundColor Yellow
try {
    $removeData = @(2) | ConvertTo-Json
    
    Write-Host "请求URL: $BASE_URL/projects/$projectId/members" -ForegroundColor Gray
    Write-Host "请求Body: $removeData" -ForegroundColor Gray
    
    $removeResult = Invoke-RestMethod -Uri "$BASE_URL/projects/$projectId/members" -Method Delete -Headers $headers -Body $removeData
    Write-Host "删除成员成功！" -ForegroundColor Green
    Write-Host "返回结果: $($removeResult | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "删除成员失败！" -ForegroundColor Red
    Write-Host "错误信息: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "详细错误: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host "状态码: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# 6. 再次查看项目成员
Write-Host "`n6. 再次查看项目成员..." -ForegroundColor Yellow
try {
    $members = Invoke-RestMethod -Uri "$BASE_URL/projects/$projectId/members" -Method Get -Headers $headers
    Write-Host "当前项目成员: $($members -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "查看成员失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. 清理：删除测试项目
Write-Host "`n7. 清理测试数据..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE_URL/projects/$projectId" -Method Delete -Headers $headers
    Write-Host "测试项目已删除" -ForegroundColor Green
} catch {
    Write-Host "删除项目失败（可能需要手动清理）: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Cyan

