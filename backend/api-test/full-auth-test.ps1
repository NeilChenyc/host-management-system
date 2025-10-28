# Full Authentication Test Script

Write-Host "\n=== Full Authentication Flow Test ==="

# Generate random username to avoid conflicts
$randomId = Get-Random -Minimum 1000 -Maximum 9999
$username = "testuser_$randomId"
$email = "testuser_$randomId@example.com"
$password = "TestPass123"

# Step 1: Register a new user
Write-Host "\n[Step 1] Attempting to register new user..."
$registerPayload = @{
    username = $username
    email = $email
    password = $password
} | ConvertTo-Json

$registerPayloadFile = New-TemporaryFile
$registerPayload | Out-File -FilePath $registerPayloadFile -Encoding utf8

$registerOutput = curl.exe -s -w "\nHTTP Status: %{http_code}\n" -X POST -H "Content-Type: application/json" -d "@$($registerPayloadFile.FullName)" http://localhost:8080/api/auth/signup

Write-Host "\nRegistration Response:"
$registerOutput

# Step 2: Try to login with the newly registered user using /signin endpoint
Write-Host "\n[Step 2] Trying to login with the newly registered user (using /signin)..."
$loginPayload = @{
    username = $username
    password = $password
} | ConvertTo-Json

$loginPayloadFile = New-TemporaryFile
$loginPayload | Out-File -FilePath $loginPayloadFile -Encoding utf8

$loginOutput = curl.exe -s -w "\nHTTP Status: %{http_code}\n" -X POST -H "Content-Type: application/json" -d "@$($loginPayloadFile.FullName)" http://localhost:8080/api/auth/signin

Write-Host "\nSignin Response:"
$loginOutput

# Step 3: Call the simple /login endpoint
Write-Host "\n[Step 3] Calling the simple /login endpoint..."
$simpleLoginOutput = curl.exe -s -w "\nHTTP Status: %{http_code}\n" -X POST http://localhost:8080/api/auth/login

Write-Host "\nSimple Login Response:"
$simpleLoginOutput

# Clean up temporary files
Remove-Item -Path $registerPayloadFile -Force
Remove-Item -Path $loginPayloadFile -Force

Write-Host "\n=== Full Test Completed ==="