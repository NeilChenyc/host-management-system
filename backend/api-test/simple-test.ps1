try {
    # Create a rule name that's likely to be unique
    $uniqueRuleName = "TestRule-$(Get-Random)"
    Write-Host "Using rule name: $uniqueRuleName"
    
    # Create JSON body
    $jsonBody = ConvertTo-Json -Compress -InputObject @{
        ruleName = $uniqueRuleName
        description = "Test Description"
        targetMetric = "CPU"
        comparator = ">"
        threshold = 0.8
        duration = 60
        severity = "HIGH"
        enabled = $true
        scopeLevel = "SERVER"
        projectId = 1
    }
    
    # First create a rule with this name (should succeed)
    Write-Host "Creating first rule..."
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/alert-rules" -Method POST -ContentType "application/json" -Body $jsonBody -UseBasicParsing
    Write-Host "First rule created with status code: $($response.StatusCode)"
    
    # Now try to create a rule with the same name (should fail with 400 if our fix works)
    Write-Host "\nAttempting to create duplicate rule..."
    try {
        $duplicateResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/alert-rules" -Method POST -ContentType "application/json" -Body $jsonBody -UseBasicParsing -ErrorAction Stop
        Write-Host "ERROR: Duplicate rule creation should have failed but got status code: $($duplicateResponse.StatusCode)"
        exit 1
    } catch {
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $responseStream = $_.Exception.Response.GetResponseStream()
            $streamReader = New-Object System.IO.StreamReader($responseStream)
            $responseBody = $streamReader.ReadToEnd()
            
            Write-Host "Status code: $statusCode"
            Write-Host "Response body: $responseBody"
            
            if ($statusCode -eq 400) {
                Write-Host "SUCCESS: Duplicate rule correctly returned 400 Bad Request"
                exit 0
            } else {
                Write-Host "ERROR: Expected 400 but got $statusCode"
                exit 1
            }
        } else {
            Write-Host "ERROR: No response received"
            exit 1
        }
    }
} catch {
    Write-Host "Test failed: $($_.Exception.Message)"
    exit 1
}