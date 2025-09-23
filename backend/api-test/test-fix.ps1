try {
    # First, try to create an AlertRule
    $ruleBody = @"
    {
        "ruleName": "Test Rule",
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

    Write-Host "Creating AlertRule..."
    $ruleResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/alert-rules" -Method POST -ContentType "application/json" -Body $ruleBody
    $ruleId = $ruleResponse.ruleId
    Write-Host "Successfully created AlertRule with ID: $ruleId"

    # Now create an AlertEvent referencing this valid AlertRule
    $eventBody = @"
    {
        "alertRule": {"ruleId": $ruleId},
        "serverId": 1,
        "status": "ACTIVE",
        "startedAt": "2025-09-19T16:30:08.876Z",
        "triggeredValue": 0.85,
        "summary": "CPU usage exceeded threshold"
    }
"@

    Write-Host "Creating AlertEvent..."
    $eventResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/alert-events" -Method POST -ContentType "application/json" -Body $eventBody
    Write-Host "Success! AlertEvent created with ID: $($eventResponse.eventId)"
    Write-Host "Our fix for the ID handling issue is working correctly!"
    
    # Also verify that the original problematic request with large ID now works
    $problematicBody = @"
    {
        "eventId": 9007199254740991,
        "alertRule": {"ruleId": $ruleId},
        "serverId": 1,
        "status": "ACTIVE",
        "startedAt": "2025-09-19T16:30:08.876Z",
        "triggeredValue": 0.85,
        "summary": "CPU usage exceeded threshold"
    }
"@

    Write-Host "Testing with original problematic request (large ID)..."
    $problematicResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/alert-events" -Method POST -ContentType "application/json" -Body $problematicBody
    Write-Host "Success! Problematic request now works! Created AlertEvent with ID: $($problematicResponse.eventId)"
    
} catch {
    Write-Host "Test failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusDescription = $_.Exception.Response.StatusDescription
        $responseBody = $_.Exception.Response.GetResponseStream() | Get-Content -Encoding utf8
        Write-Host "Status Code: $statusCode - $statusDescription"
        Write-Host "Response Body: $responseBody"
    }
    exit 1
}