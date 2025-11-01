# 创建Agent部署包

param(
    [string]$PlatformIP = "localhost",
    [int]$ServerId = 2,
    [string]$OutputDir = "agent-deployment-package"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Agent Deployment Package Creator" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 获取平台IP
if ($PlatformIP -eq "localhost") {
    Write-Host "Enter your platform server IP address:" -ForegroundColor Yellow
    Write-Host "(e.g., 192.168.1.100 or your public IP)" -ForegroundColor Gray
    $PlatformIP = Read-Host "Platform IP"
}

# 获取服务器ID
Write-Host "`nEnter the Server ID for the remote machine:" -ForegroundColor Yellow
Write-Host "(Create this in your platform first!)" -ForegroundColor Gray
$ServerId = Read-Host "Server ID"

# 创建输出目录
if (Test-Path $OutputDir) {
    Remove-Item $OutputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $OutputDir | Out-Null

Write-Host "`nCreating deployment package..." -ForegroundColor Yellow

# 1. 复制Agent脚本
Copy-Item "server_agent.py" "$OutputDir/" -ErrorAction Stop
Write-Host "  ✓ Copied server_agent.py" -ForegroundColor Green

# 2. 创建配置文件
$config = @{
    platform_url = "http://${PlatformIP}:8080/api/servers/metrics/collect"
    server_id = [int]$ServerId
    interval = 60
    log_level = "INFO"
} | ConvertTo-Json

$config | Out-File "$OutputDir/agent_config.json" -Encoding UTF8
Write-Host "  ✓ Created agent_config.json" -ForegroundColor Green

# 3. 创建Windows安装脚本
$winInstall = @'
@echo off
echo ========================================
echo   Installing Server Monitoring Agent
echo ========================================

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo Python found!

:: Install dependencies
echo Installing dependencies...
pip install psutil requests

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Configuration:
type agent_config.json
echo.
echo To start agent, run:
echo   python server_agent.py
echo.
pause
'@

$winInstall | Out-File "$OutputDir/install_windows.bat" -Encoding ASCII
Write-Host "  ✓ Created install_windows.bat" -ForegroundColor Green

# 4. 创建Linux安装脚本
$linuxInstall = @'
#!/bin/bash

echo "========================================"
echo "  Installing Server Monitoring Agent"
echo "========================================"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Installing Python3..."
    
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip
    elif command -v yum &> /dev/null; then
        sudo yum install -y python3 python3-pip
    else
        echo "Please install Python3 manually"
        exit 1
    fi
fi

echo "Python found: $(python3 --version)"

# Install dependencies
echo "Installing dependencies..."
pip3 install psutil requests

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

# Make agent executable
chmod +x server_agent.py

echo ""
echo "========================================"
echo "  Installation Complete!"
echo "========================================"
echo ""
echo "Configuration:"
cat agent_config.json
echo ""
echo "To start agent, run:"
echo "  python3 server_agent.py"
echo ""
'@

$linuxInstall | Out-File "$OutputDir/install_linux.sh" -Encoding UTF8
Write-Host "  ✓ Created install_linux.sh" -ForegroundColor Green

# 5. 创建Windows启动脚本
$winStart = @'
@echo off
cd /d %~dp0
python server_agent.py
pause
'@

$winStart | Out-File "$OutputDir/start_agent_windows.bat" -Encoding ASCII
Write-Host "  ✓ Created start_agent_windows.bat" -ForegroundColor Green

# 6. 创建Linux启动脚本
$linuxStart = @'
#!/bin/bash
cd "$(dirname "$0")"
python3 server_agent.py
'@

$linuxStart | Out-File "$OutputDir/start_agent_linux.sh" -Encoding UTF8
Write-Host "  ✓ Created start_agent_linux.sh" -ForegroundColor Green

# 7. 创建README
$readme = @"
# Server Monitoring Agent Deployment Package

## Configuration

This package is configured for:
- Platform URL: http://${PlatformIP}:8080/api/servers/metrics/collect
- Server ID: $ServerId
- Collection Interval: 60 seconds

## Installation

### Windows
1. Double-click install_windows.bat
2. Wait for installation to complete
3. Double-click start_agent_windows.bat to start

### Linux/Mac
1. Open terminal in this directory
2. Run: chmod +x install_linux.sh
3. Run: ./install_linux.sh
4. Run: python3 server_agent.py

## Requirements

- Python 3.8 or higher
- Network access to $PlatformIP:8080
- Internet connection (for installing dependencies)

## Verification

After starting the agent, you should see:
- "✓ 指标推送成功 (HTTP 200)" - means data is being sent successfully
- System metrics displayed every 60 seconds

## Troubleshooting

If you see "连接失败" (Connection failed):
1. Check if platform server is running
2. Verify firewall allows port 8080
3. Test connection: curl http://${PlatformIP}:8080/actuator/health

If you see "401 Unauthorized":
1. Contact the platform administrator
2. The metrics collection endpoint may need configuration

## Files

- server_agent.py: Main agent program
- agent_config.json: Configuration file
- install_windows.bat: Windows installation script
- install_linux.sh: Linux installation script
- start_agent_windows.bat: Windows startup script
- start_agent_linux.sh: Linux startup script

## Support

For issues, contact your platform administrator.

Platform Server: $PlatformIP:8080
Server ID: $ServerId
"@

$readme | Out-File "$OutputDir/README.txt" -Encoding UTF8
Write-Host "  ✓ Created README.txt" -ForegroundColor Green

# 8. 显示摘要
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Package Created Successfully!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Location: $OutputDir" -ForegroundColor White
Write-Host "`nPackage Contents:" -ForegroundColor Yellow
Get-ChildItem $OutputDir | ForEach-Object { 
    Write-Host "  - $($_.Name)" -ForegroundColor Gray 
}

Write-Host "`nConfiguration:" -ForegroundColor Yellow
Write-Host "  Platform IP: $PlatformIP" -ForegroundColor White
Write-Host "  Server ID: $ServerId" -ForegroundColor White
Write-Host "  Endpoint: http://${PlatformIP}:8080/api/servers/metrics/collect" -ForegroundColor Gray

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Copy the '$OutputDir' folder to the target machine" -ForegroundColor White
Write-Host "  2. On Windows: Run install_windows.bat" -ForegroundColor White
Write-Host "  3. On Linux: Run install_linux.sh" -ForegroundColor White
Write-Host "  4. Start the agent and verify connection" -ForegroundColor White

Write-Host "`nYou can also create a ZIP file:" -ForegroundColor Yellow
Write-Host "  Compress-Archive -Path $OutputDir -DestinationPath agent-package.zip" -ForegroundColor Gray

Write-Host ""

