# System Health Agent SDK

Goal: Collect real-time (or near real-time) server metrics and write them to the existing PostgreSQL database without changing backend code, so the backend/frontend can read the latest data through existing APIs.

## Quick Start

### Simplest Way to Start

1. **Install Dependencies**
   ```bash
   pip install psutil psycopg2-binary PyYAML
   ```

2. **Configure Database Connection**
   ```bash
   cp config.example.yaml config.yaml
   # Edit config.yaml and fill in database connection information
   ```

3. **Start Agent**
   ```bash
   python3 system_health_agent.py --config config.yaml
   ```

The Agent will automatically:
- Generate unique machine identifier
- Register new server in database (if not already registered)
- Start collecting and reporting system metrics
- Save server_id to local file `.server_id` for future use

### One-time Test Run
```bash
python3 system_health_agent.py --config config.yaml --once
```

### Start with Script
```bash
bash scripts/run_agent.sh
```

Core Idea: Deploy a lightweight Python agent on each target host. Use `psutil` to collect CPU, memory, disk, network, load, and temperature metrics, and write them directly into the `server_metrics` table. The backend already exposes endpoints to read the latest metrics (for example, `GET /api/servers/{serverId}/metrics/latest`), so no backend changes are required.

This SDK also supports an “adapter layer” to integrate common monitoring tools (Telegraf, Node Exporter + Prometheus, Zabbix Agent, etc.). You only need to convert their collected metrics into this system’s table schema and insert them into the database.

**Architecture**
- Collection: Python script (`agent-sdk/system_health_agent.py`), or external monitoring software + adapter script.
- Transport: Direct writes to PostgreSQL (least-privileged account).
- Storage: Existing `server_metrics` table; the backend already provides read APIs.
- Presentation: Existing frontend pages and backend controllers; no changes needed.

**Supported Metrics**
- CPU: `cpu_usage` (percentage)
- Memory: `memory_usage` (percentage)
- Disk: `disk_usage` (percentage; default mount `/`, configurable)
- Network: `network_in`, `network_out` (percentage of bandwidth or MB/s, configurable)
- Load: `load_avg` (1-minute average)
- Temperature: `temperature` (may be unavailable on some cloud hosts; empty is fine)
- Timestamp: `collected_at` (written by Agent)

**Network Monitoring Features**
- **Bandwidth Detection**: Automatically detects network interface bandwidth on Linux (via ethtool or /sys), macOS, and Windows
- **Percentage Mode**: When `network_as_percentage: true`, displays network usage as percentage of detected bandwidth
- **Fallback Mode**: When bandwidth detection fails or `network_as_percentage: false`, shows absolute values in MB/s
- **Interface Selection**: Monitor specific interface or all interfaces combined via `network_interface` setting

Field names and table mapping follow the entity classes: `ServerMetrics` maps to `server_metrics` with columns `server_id`, `cpu_usage`, `memory_usage`, `disk_usage`, `network_in`, `network_out`, `load_avg`, `temperature`, `collected_at`. `Server` maps to `servers`, including `server_name`, `ip_address`, etc.

**Database Permissions & Security**
- Create a least-privileged DB user for the Agent (only allow `INSERT server_metrics` and `SELECT servers`).
- See SQL script: `agent-sdk/sql/create_agent_user.sql`.
- Security recommendations: enable PostgreSQL TLS, restrict source IPs, store credentials in a secure secret manager (e.g., Vault).

**Deployment Steps**
1) **Quick Start (Recommended)**
   - Install dependencies: `pip install psutil psycopg2-binary PyYAML`
   - Copy configuration: `cp config.example.yaml config.yaml`
   - Edit `config.yaml` and fill in database connection information
   - Start: `python3 system_health_agent.py --config config.yaml`
   - Agent will automatically register server and start collecting metrics

2) Traditional deployment (requires manual server_id configuration)
   - Prepare database user permissions: run `agent-sdk/sql/create_agent_user.sql`
   - Manually create server record in `servers` table
   - Specify `server_id` in configuration file

**Docker Deployment Notes**
- Command is wrapped: `agent-sdk/scripts/build_and_run_docker.sh`
- Base image: `python:3.11-slim`, installs `psutil`, `psycopg2-binary`, `PyYAML`.
- Provide configuration by mounting to `/app/config.yaml`.

**Systemd Service**
- Example file: `agent-sdk/systemd/system-health-agent.service`
- Note: Adjust `ExecStart` path and `User/Group` for your environment; ensure `config.yaml` is placed at the configured path with proper permissions.

**Configuration Example**
- Refer to `agent-sdk/config.example.yaml`:
  - `db.host/port/database/user/password/sslmode` - Database connection configuration
  - Agent now supports automatic server registration, no need to manually configure `server_id`
  - Optional configurations: `metrics.interval_seconds/disk_mount/include_temperature/network_interface`

**Verify Running Status**
- Database level: `bash agent-sdk/scripts/validate_latest_metrics.sh`
- Backend API level: call `GET /api/servers/{id}/metrics/latest`, check if `collected_at` is updated
- Check local `.server_id` file to confirm server ID

**Integrating Other Monitoring Software (No Backend Changes)**
- Telegraf: collect via `inputs.*`, then use `outputs.exec` to run a DB write script (Python or shell invoking `psql`).
- Node Exporter + Prometheus: periodically query Prometheus for the host’s metrics (or use Pushgateway), then insert into `server_metrics`.
- Zabbix Agent: trigger a local write script in active mode, or pull via Zabbix API and write to DB.

**Performance & Stability Recommendations**
- Control write frequency (default 5 seconds) to avoid DB pressure; increase the interval as needed.
- Historical data cleanup: the project already performs daily cleanup keeping about 7 days (see code for exact policy). Consider partitioned tables or a longer retention strategy if needed.
- Adapt to environment-specific NIC names and disk mount points; temperature may be unavailable on some cloud hosts.

**Troubleshooting**
- Agent startup failure: check database connection configuration and network connectivity
- Abnormal metric data: verify `psutil` support and permissions, confirm disk mount points and network interface names are correct
- Server duplicate registration: delete `.server_id` file to re-register, or check machine identifier generation logic
- Write failures: check DB address, port, credentials, permissions, and network connectivity; enable `sslmode=require` as needed

**Rollback Strategy**
- Stop the Agent service or container to stop writes; the backend continues to read historical data and functionality remains intact.