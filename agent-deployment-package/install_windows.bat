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
