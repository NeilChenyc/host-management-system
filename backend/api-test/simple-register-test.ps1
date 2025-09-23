# Simple Register API Test Script using curl

Write-Host "\n=== Testing User Registration API ==="

# Generate random username to avoid conflicts
$randomId = Get-Random -Minimum 1000 -Maximum 9999
$username = "testuser_$randomId"
$email = "testuser_$randomId@example.com"

Write-Host "Attempting to register user: $username with email: $email"

# Create JSON payload
$payload = @{
    username = $username
    email = $email
    password = "TestPass123"
} | ConvertTo-Json

# Write payload to a temporary file
$payloadFile = New-TemporaryFile
$payload | Out-File -FilePath $payloadFile -Encoding utf8

# Run curl command to test registration
Write-Host "\nSending registration request..."
$curlOutput = curl.exe -s -w "\nHTTP Status: %{http_code}\n" -X POST -H "Content-Type: application/json" -d "@$($payloadFile.FullName)" http://localhost:8080/api/auth/signup

# Display results
Write-Host "\nResponse:"
$curlOutput

# Clean up temporary file
Remove-Item -Path $payloadFile -Force

Write-Host "\n=== Test Completed ==="