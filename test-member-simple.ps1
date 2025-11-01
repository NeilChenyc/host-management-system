# Simple test for project member management
$BASE_URL = "http://localhost:8080/api"

Write-Host "=== Testing Project Member Management ===" -ForegroundColor Cyan

# 1. Login as Admin
Write-Host "`n1. Logging in as Admin..." -ForegroundColor Yellow
$loginBody = '{"username":"admin","password":"admin123"}'
$loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/signin" -Method Post -ContentType "application/json" -Body $loginBody
$token = $loginResponse.token
Write-Host "Token obtained successfully" -ForegroundColor Green

# 2. Create test project
Write-Host "`n2. Creating test project..." -ForegroundColor Yellow
$projectBody = '{"name":"Test Member Project","description":"Testing member management","status":"ACTIVE"}'
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$project = Invoke-RestMethod -Uri "$BASE_URL/projects" -Method Post -Headers $headers -Body $projectBody
$projectId = $project.id
Write-Host "Project created with ID: $projectId" -ForegroundColor Green

# 3. Test adding members
Write-Host "`n3. Testing add members (user IDs: 2, 3)..." -ForegroundColor Yellow
$memberBody = '[2, 3]'
Write-Host "Request URL: $BASE_URL/projects/$projectId/members" -ForegroundColor Gray
Write-Host "Request Body: $memberBody" -ForegroundColor Gray

try {
    $addResult = Invoke-RestMethod -Uri "$BASE_URL/projects/$projectId/members" -Method Post -Headers $headers -Body $memberBody
    Write-Host "Add members SUCCESS!" -ForegroundColor Green
} catch {
    Write-Host "Add members FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# 4. Check members
Write-Host "`n4. Checking project members..." -ForegroundColor Yellow
try {
    $members = Invoke-RestMethod -Uri "$BASE_URL/projects/$projectId/members" -Method Get -Headers $headers
    Write-Host "Current members: $members" -ForegroundColor Green
} catch {
    Write-Host "Failed to get members: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test removing members
Write-Host "`n5. Testing remove member (user ID: 2)..." -ForegroundColor Yellow
$removeBody = '[2]'
Write-Host "Request URL: $BASE_URL/projects/$projectId/members" -ForegroundColor Gray
Write-Host "Request Body: $removeBody" -ForegroundColor Gray

try {
    $removeResult = Invoke-RestMethod -Uri "$BASE_URL/projects/$projectId/members" -Method Delete -Headers $headers -Body $removeBody
    Write-Host "Remove member SUCCESS!" -ForegroundColor Green
} catch {
    Write-Host "Remove member FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# 6. Check members again
Write-Host "`n6. Checking project members again..." -ForegroundColor Yellow
try {
    $members = Invoke-RestMethod -Uri "$BASE_URL/projects/$projectId/members" -Method Get -Headers $headers
    Write-Host "Current members: $members" -ForegroundColor Green
} catch {
    Write-Host "Failed to get members: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Cleanup
Write-Host "`n7. Cleaning up..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE_URL/projects/$projectId" -Method Delete -Headers $headers | Out-Null
    Write-Host "Test project deleted" -ForegroundColor Green
} catch {
    Write-Host "Failed to delete project: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan

