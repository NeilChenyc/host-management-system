-- Create a least-privileged database user for the System Health Agent
-- This user can only INSERT metrics data and SELECT server information

-- Note: Run this script as a PostgreSQL superuser or database owner
-- Example: psql -U postgres -d b2b_system_health -f create_agent_user.sql

-- Create the agent_writer role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'agent_writer') THEN
        CREATE ROLE agent_writer LOGIN;
        RAISE NOTICE 'Created role agent_writer';
    ELSE
        RAISE NOTICE 'Role agent_writer already exists';
    END IF;
END
$$;

-- Set a secure password (CHANGE THIS IN PRODUCTION!)
ALTER ROLE agent_writer PASSWORD 'change_me_secure_password';

-- Grant minimal required permissions
-- Allow INSERT on server_metrics table (to write metrics data)
GRANT INSERT ON TABLE public.server_metrics TO agent_writer;

-- Allow SELECT on servers table (to resolve server_id by name/IP)
GRANT SELECT ON TABLE public.servers TO agent_writer;

-- Grant USAGE on the schema
GRANT USAGE ON SCHEMA public TO agent_writer;

-- Optional: Grant SELECT on server_metrics for debugging/validation
-- Uncomment the next line if you want the agent to be able to read its own data
-- GRANT SELECT ON TABLE public.server_metrics TO agent_writer;

-- Security recommendations:
-- 1. Change the default password to a strong, unique password
-- 2. Consider using certificate-based authentication instead of passwords
-- 3. Restrict connections by IP address in pg_hba.conf
-- 4. Enable SSL/TLS connections (sslmode=require in config)
-- 5. Regularly rotate passwords and review permissions

COMMIT;