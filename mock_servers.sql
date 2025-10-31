-- Mock server data for testing
-- This script inserts various types of servers with different statuses and configurations

INSERT INTO servers (server_name, ip_address, status, operating_system, cpu, memory, last_update, created_at, updated_at) VALUES
-- Web servers
('web-server-01', '192.168.1.10', 'online', 'Ubuntu 22.04 LTS', 'Intel Xeon E5-2680 v4 @ 2.40GHz (14 cores)', '32 GB DDR4', NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 minutes'),
('web-server-02', '192.168.1.11', 'online', 'Ubuntu 22.04 LTS', 'Intel Xeon E5-2680 v4 @ 2.40GHz (14 cores)', '32 GB DDR4', NOW() - INTERVAL '3 minutes', NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 minutes'),
('web-server-03', '192.168.1.12', 'maintenance', 'Ubuntu 20.04 LTS', 'Intel Xeon E5-2660 v3 @ 2.60GHz (10 cores)', '16 GB DDR4', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 hours'),

-- Database servers
('db-primary-01', '192.168.2.10', 'online', 'CentOS 8', 'AMD EPYC 7742 @ 2.25GHz (64 cores)', '128 GB DDR4', NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '45 days', NOW() - INTERVAL '2 minutes'),
('db-replica-01', '192.168.2.11', 'online', 'CentOS 8', 'AMD EPYC 7742 @ 2.25GHz (64 cores)', '128 GB DDR4', NOW() - INTERVAL '4 minutes', NOW() - INTERVAL '40 days', NOW() - INTERVAL '4 minutes'),
('db-backup-01', '192.168.2.12', 'offline', 'CentOS 7', 'Intel Xeon Gold 6248 @ 2.50GHz (20 cores)', '64 GB DDR4', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '35 days', NOW() - INTERVAL '6 hours'),

-- Application servers
('app-server-01', '192.168.3.10', 'online', 'Red Hat Enterprise Linux 8', 'Intel Xeon Platinum 8280 @ 2.70GHz (28 cores)', '64 GB DDR4', NOW() - INTERVAL '1 minute', NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 minute'),
('app-server-02', '192.168.3.11', 'online', 'Red Hat Enterprise Linux 8', 'Intel Xeon Platinum 8280 @ 2.70GHz (28 cores)', '64 GB DDR4', NOW() - INTERVAL '7 minutes', NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 minutes'),
('app-server-03', '192.168.3.12', 'warning', 'Red Hat Enterprise Linux 7', 'Intel Xeon E5-2690 v4 @ 2.60GHz (14 cores)', '32 GB DDR4', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '50 days', NOW() - INTERVAL '15 minutes'),

-- Load balancers
('lb-01', '192.168.4.10', 'online', 'Ubuntu 22.04 LTS', 'Intel Core i7-9700K @ 3.60GHz (8 cores)', '16 GB DDR4', NOW() - INTERVAL '30 seconds', NOW() - INTERVAL '10 days', NOW() - INTERVAL '30 seconds'),
('lb-02', '192.168.4.11', 'online', 'Ubuntu 22.04 LTS', 'Intel Core i7-9700K @ 3.60GHz (8 cores)', '16 GB DDR4', NOW() - INTERVAL '45 seconds', NOW() - INTERVAL '8 days', NOW() - INTERVAL '45 seconds'),

-- Cache servers
('cache-redis-01', '192.168.5.10', 'online', 'Debian 11', 'AMD Ryzen 9 5950X @ 3.40GHz (16 cores)', '64 GB DDR4', NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '18 days', NOW() - INTERVAL '2 minutes'),
('cache-redis-02', '192.168.5.11', 'online', 'Debian 11', 'AMD Ryzen 9 5950X @ 3.40GHz (16 cores)', '64 GB DDR4', NOW() - INTERVAL '3 minutes', NOW() - INTERVAL '16 days', NOW() - INTERVAL '3 minutes'),
('cache-memcached-01', '192.168.5.12', 'offline', 'Debian 10', 'Intel Xeon E3-1270 v6 @ 3.80GHz (4 cores)', '32 GB DDR4', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '22 days', NOW() - INTERVAL '4 hours'),

-- File servers
('file-server-01', '192.168.6.10', 'online', 'Windows Server 2022', 'Intel Xeon Silver 4214 @ 2.20GHz (12 cores)', '48 GB DDR4', NOW() - INTERVAL '8 minutes', NOW() - INTERVAL '28 days', NOW() - INTERVAL '8 minutes'),
('file-server-02', '192.168.6.11', 'maintenance', 'Windows Server 2019', 'Intel Xeon Bronze 3204 @ 1.90GHz (6 cores)', '32 GB DDR4', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '32 days', NOW() - INTERVAL '1 hour'),

-- Monitoring servers
('monitor-prometheus-01', '192.168.7.10', 'online', 'Ubuntu 22.04 LTS', 'Intel Core i5-12600K @ 3.70GHz (10 cores)', '32 GB DDR4', NOW() - INTERVAL '1 minute', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 minute'),
('monitor-grafana-01', '192.168.7.11', 'online', 'Ubuntu 22.04 LTS', 'Intel Core i5-12600K @ 3.70GHz (10 cores)', '32 GB DDR4', NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 minutes'),

-- Development servers
('dev-server-01', '192.168.8.10', 'online', 'Ubuntu 22.04 LTS', 'AMD Ryzen 7 5800X @ 3.80GHz (8 cores)', '32 GB DDR4', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '7 days', NOW() - INTERVAL '10 minutes'),
('dev-server-02', '192.168.8.11', 'warning', 'Ubuntu 20.04 LTS', 'Intel Core i7-10700K @ 3.80GHz (8 cores)', '16 GB DDR4', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '14 days', NOW() - INTERVAL '20 minutes'),

-- Testing servers
('test-server-01', '192.168.9.10', 'online', 'CentOS 8', 'Intel Xeon E-2288G @ 3.70GHz (8 cores)', '32 GB DDR4', NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 minutes'),
('test-server-02', '192.168.9.11', 'offline', 'CentOS 7', 'Intel Xeon E3-1230 v6 @ 3.50GHz (4 cores)', '16 GB DDR4', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '21 days', NOW() - INTERVAL '8 hours');