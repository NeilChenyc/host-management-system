try {
    $jsonBody = @"
    {
        "alertRule": {
            "ruleId": 1,
            "ruleName": "Test Rule",
            "description": "Test Description",
            "targetMetric": "CPU",
            "comparator": ">",
            "threshold": 0.8,
            "duration": 60,
            "severity": "HIGH",
            "enabled": true
        },
        "serverId": 1,
        "status": "ACTIVE",
        "startedAt": "2025-09-19T16:30:08.876Z",
        "triggeredValue": 0.85,
        "summary": "CPU usage exceeded threshold"
    }
"@

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/alert-events" -Method POST -ContentType "application/json" -Body $jsonBody
    Write-Host "API call successful!"
    Write-Host "Response:"
    $response | ConvertTo-Json
} catch {
    Write-Host "API call failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusDescription = $_.Exception.Response.StatusDescription
        Write-Host "Status Code: $statusCode - $statusDescription"
    }
    exit 1
}