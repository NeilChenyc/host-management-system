# Simple API Test Script

# Test 1: Call signin endpoint
Write-Host "\n=== Test 1: Calling /api/auth/signin ==="
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" -Method Post -ContentType "application/json" -Body '{"username":"testuser","password":"testpass"}' -UseBasicParsing
    Write-Host "Signin Response Status: Success"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Signin Response Status: Failed (Expected)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value__)"
    try {
        $errorContent = $_.Exception.Response.GetResponseStream() | Get-Content -Encoding utf8
        Write-Host "Error Content: $errorContent"
    } catch {
        Write-Host "Could not retrieve error content"
    }
}

# Test 2: Call login endpoint
Write-Host "\n=== Test 2: Calling /api/auth/login ==="
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -UseBasicParsing
    Write-Host "Login Response Status: Success"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Login Response Status: Failed"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value__)"
    try {
        $errorContent = $_.Exception.Response.GetResponseStream() | Get-Content -Encoding utf8
        Write-Host "Error Content: $errorContent"
    } catch {
        Write-Host "Could not retrieve error content"
    }
}

# Difference between signin and login
Write-Host "\n=== Difference between signin and login ==="
Write-Host "1. /api/auth/signin: Requires username and password, performs actual authentication"
Write-Host "2. /api/auth/login: No parameters required, always returns success (no real authentication)"