#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   export PGHOST=localhost
#   export PGPORT=5432
#   export PGDATABASE=b2b_system_health
#   export PGUSER=agent_writer
#   export PGPASSWORD=change_me
#   ./agent-sdk/scripts/validate_latest_metrics.sh <server_id>

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <server_id>"
  exit 1
fi

SERVER_ID="$1"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required. Please install PostgreSQL client tools."
  exit 1
fi

echo "Querying latest 5 records for server_id=${SERVER_ID}..."
psql -X -v ON_ERROR_STOP=1 -c "\
SELECT metric_id, server_id, cpu_usage, memory_usage, disk_usage, \
       network_in, network_out, load_avg, temperature, collected_at \
FROM server_metrics \
WHERE server_id = ${SERVER_ID} \
ORDER BY collected_at DESC \
LIMIT 5;"