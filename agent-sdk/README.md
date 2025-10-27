# System Health Agent SDK

Goal: Collect real-time (or near real-time) server metrics and write them to the existing PostgreSQL database without changing backend code, so the backend/frontend can read the latest data through existing APIs.

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
- Network: `network_in`, `network_out` (MB/s, derived from sampling interval)
- Load: `load_avg` (1-minute average)
- Temperature: `temperature` (may be unavailable on some cloud hosts; empty is fine)
- Timestamp: `collected_at` (written by Agent)

Field names and table mapping follow the entity classes: `ServerMetrics` maps to `server_metrics` with columns `server_id`, `cpu_usage`, `memory_usage`, `disk_usage`, `network_in`, `network_out`, `load_avg`, `temperature`, `collected_at`. `Server` maps to `servers`, including `server_name`, `ip_address`, etc.

**Database Permissions & Security**
- Create a least-privileged DB user for the Agent (only allow `INSERT server_metrics` and `SELECT servers`).
- See SQL script: `agent-sdk/sql/create_agent_user.sql`.
- Security recommendations: enable PostgreSQL TLS, restrict source IPs, store credentials in a secure secret manager (e.g., Vault).

**Deployment Steps**
1) Prepare a least-privileged DB user
   - Run: `agent-sdk/sql/create_agent_user.sql` as a DB admin user.
   - Update password and database name; ensure the target schema (default `public`) is consistent.

2) Install dependencies
   - Local: `pip install psutil psycopg2-binary PyYAML`
   - Or Docker: build an image using `agent-sdk/docker/Dockerfile`.

3) Copy and edit configuration
   - Copy `agent-sdk/config.example.yaml` to `agent-sdk/config.yaml`, and fill in DB connection and host identification (prefer specifying `server_id`).

4) Run the Agent
   - Local: `bash agent-sdk/scripts/run_agent.sh`
   - Docker: `bash agent-sdk/scripts/build_and_run_docker.sh`
   - Systemd: use `agent-sdk/systemd/system-health-agent.service`, deploy to `/etc/systemd/system/`, create the working directory `/opt/system-health-agent/`, and provide `config.yaml`.

5) Verify
   - DB level: `bash agent-sdk/scripts/validate_latest_metrics.sh` (uses `psql` to query the latest record for a given `server_id`).
   - Backend API level: call `GET /api/servers/{id}/metrics/latest`; `collected_at` should update.

**Docker Deployment Notes**
- Command is wrapped: `agent-sdk/scripts/build_and_run_docker.sh`
- Base image: `python:3.11-slim`, installs `psutil`, `psycopg2-binary`, `PyYAML`.
- Provide configuration by mounting to `/app/config.yaml`.

**Systemd Service**
- Example file: `agent-sdk/systemd/system-health-agent.service`
- Note: Adjust `ExecStart` path and `User/Group` for your environment; ensure `config.yaml` is placed at the configured path with proper permissions.

**Configuration Example**
- Refer to `agent-sdk/config.example.yaml`:
  - `db.host/port/database/user/password/sslmode`
  - `server_identification.server_id` (preferred), or `server_name` + `auto_detect_ip` as a fallback to resolve ID.
  - `metrics.interval_seconds/disk_mount/include_temperature/network_interface`

**Integrating Other Monitoring Software (No Backend Changes)**
- Telegraf: collect via `inputs.*`, then use `outputs.exec` to run a DB write script (Python or shell invoking `psql`).
- Node Exporter + Prometheus: periodically query Prometheus for the host’s metrics (or use Pushgateway), then insert into `server_metrics`.
- Zabbix Agent: trigger a local write script in active mode, or pull via Zabbix API and write to DB.

**Performance & Stability Recommendations**
- Control write frequency (default 5 seconds) to avoid DB pressure; increase the interval as needed.
- Historical data cleanup: the project already performs daily cleanup keeping about 7 days (see code for exact policy). Consider partitioned tables or a longer retention strategy if needed.
- Adapt to environment-specific NIC names and disk mount points; temperature may be unavailable on some cloud hosts.

**Troubleshooting**
- Cannot resolve `server_id`: ensure an entry exists in the `servers` table for this host, or specify `server_id` directly in configuration.
- Write failures: check DB address, port, credentials, permissions, and network connectivity; enable `sslmode=require` as needed.
- Empty or abnormal metrics: verify `psutil` support and permissions, and that the disk mount and NIC names are correct.

**Rollback Strategy**
- Stop the Agent service or container to stop writes; the backend continues to read historical data and functionality remains intact.
