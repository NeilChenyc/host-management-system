# Test script to verify the fixed AlertRule creation endpoint

Write-Host "Testing AlertRule creation endpoint..."

# JSON payload without specifying ruleId
$jsonBody = @"
{
  "ruleName": "Test Rule Fixed",
  "description": "Test rule to verify the fix",
  "targetMetric": "cpu_usage",
  "comparator": "gt",
  "threshold": 80.0,
  "duration": 30,
  "severity": "high",
  "enabled": true,
  "scopeLevel": "server",
  "projectId": 1
}
"@

try {
    # Send POST request to create alert rule
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/alert-rules" -Method Post -ContentType "application/json" -Body $jsonBody
    
    # Display success message and response
    Write-Host -ForegroundColor Green "Success! AlertRule created with ID: $($response.ruleId)"
    Write-Host "Response:"
    $response | ConvertTo-Json | Write-Host
} catch {
    # Display error message if request fails
    Write-Host -ForegroundColor Red "Error creating AlertRule: $_"
    if ($_.Exception.Response) {
        $errorContent = Get-Content $_.Exception.Response.GetResponseStream() -Encoding UTF8
        Write-Host -ForegroundColor Red "Error details: $errorContent"
    }
}