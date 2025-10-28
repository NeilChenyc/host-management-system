# Register API Test Script

# Test 1: Call signup endpoint to register a new user
Write-Host "\n=== Test 1: Calling /api/auth/signup ==="
try {
    $randomId = Get-Random -Minimum 1000 -Maximum 9999
    $username = "testuser_$randomId"
    $email = "testuser_$randomId@example.com"
    
    Write-Host "Attempting to register new user: $username"
    $userData = @{
        username = $username
        email = $email
        password = "TestPass123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signup" -Method Post -ContentType "application/json" -Body $userData -UseBasicParsing
    Write-Host "Signup Response Status: Success"
    $response | ConvertTo-Json -Depth 10
    
    # Test 2: Try to login with the newly registered user
    Write-Host "\n=== Test 2: Trying to login with the newly registered user ==="
    try {
        $loginData = @{
            username = $username
            password = "TestPass123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signin" -Method Post -ContentType "application/json" -Body $loginData -UseBasicParsing
        Write-Host "Login with new user Response Status: Success"
        $loginResponse | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "Login with new user Response Status: Failed"
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value__), Error: $($_.Exception.Message)"
    }
    
} catch {
    Write-Host "Signup Response Status: Failed"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value__), Error: $($_.Exception.Message)"
    try {
        $errorContent = $_.Exception.Response.GetResponseStream() | Get-Content -Encoding utf8
        Write-Host "Error Content: $errorContent"
    } catch {
        Write-Host "Could not retrieve detailed error content"
    }
}

# Test 3: Try to register with an existing username (should fail)
Write-Host "\n=== Test 3: Trying to register with an existing username ==="
try {
    $existingUserData = @{
        username = "testuser_$randomId"  # Reusing the same username from Test 1
        email = "different_email@example.com"
        password = "AnotherPass456"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signup" -Method Post -ContentType "application/json" -Body $existingUserData -UseBasicParsing
    Write-Host "Signup with existing username Response Status: Success (Unexpected)"
} catch {
    Write-Host "Signup with existing username Response Status: Failed (Expected - Duplicate username)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value__), Error: $($_.Exception.Message)"
}