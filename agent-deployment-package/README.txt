# Server Monitoring Agent Deployment Package

## Configuration

This package is configured for:
- Platform URL: http://192.168.0.10:8080/api/servers/metrics/collect
- Server ID: 2
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
- Network access to 
- Internet connection (for installing dependencies)

## Verification

After starting the agent, you should see:
- "鉁?鎸囨爣鎺ㄩ€佹垚鍔?(HTTP 200)" - means data is being sent successfully
- System metrics displayed every 60 seconds

## Troubleshooting

If you see "杩炴帴澶辫触" (Connection failed):
1. Check if platform server is running
2. Verify firewall allows port 8080
3. Test connection: curl http://192.168.0.10:8080/actuator/health

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

Platform Server: 
Server ID: 2
