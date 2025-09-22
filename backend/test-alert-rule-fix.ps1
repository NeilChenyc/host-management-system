try {
    # First, create a new AlertRule with a unique name
    $uniqueRuleName = "TestRule-$(Get-Random)"
    $ruleBody = @"
    {
        "ruleName": "$uniqueRuleName",
        "description": "Test Description",
        "targetMetric": "CPU",
        "comparator": ">",
        "threshold": 0.8,
        "duration": 60,
        "severity": "HIGH",
        "enabled": true,
        "scopeLevel": "SERVER",
        "projectId": 1
    }
"@

    Write-Host "Creating AlertRule with unique name '$uniqueRuleName'..."
    $ruleResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/alert-rules" -Method POST -ContentType "application/json" -Body $ruleBody
    $ruleId = $ruleResponse.ruleId
    Write-Host "SUCCESS! AlertRule created with ID: $ruleId"
    
    # Now try to create an AlertRule with the same name (should now return 400 Bad Request)
    Write-Host "\nTesting duplicate rule name detection..."
    try {
        Invoke-RestMethod -Uri "http://localhost:8080/api/alert-rules" -Method POST -ContentType "application/json" -Body $ruleBody -ErrorAction Stop
        Write-Host "FAIL: Duplicate rule creation should have failed!"
        exit 1
    } catch {
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $responseBody = $_.Exception.Response.GetResponseStream() | Get-Content -Encoding utf8
            
            if ($statusCode -eq 400) {
                Write-Host "SUCCESS! Duplicate rule name correctly returned 400 Bad Request"
                Write-Host "Error message: $responseBody"
            } else {
                Write-Host "FAIL: Expected 400 Bad Request but got $statusCode"
                Write-Host "Response: $responseBody"
                exit 1
            }
        } else {
            Write-Host "FAIL: Request failed without HTTP response"
            exit 1
        }
    }
    
    Write-Host "\nAll tests passed! Our fix for the duplicate rule name issue is working correctly."
    Write-Host "- Creating rules with unique names works as expected"
    Write-Host "- Creating rules with duplicate names now returns 400 Bad Request instead of 500 Internal Server Error"
    
} catch {
    Write-Host "Test failed: $($_.Exception.Message)"
    exit 1
}