-- Mock Data for Server Monitoring System
-- 服务器监控系统Mock数据 - H2兼容版本

-- 1. 用户表 (users) Mock数据
INSERT INTO users (username, password_hash, email, role, created_at) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaUKk7h.T0mUO', 'admin@company.com', 'admin', CURRENT_TIMESTAMP),
('operator1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaUKk7h.T0mUO', 'operator1@company.com', 'operator', CURRENT_TIMESTAMP),
('operator2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaUKk7h.T0mUO', 'operator2@company.com', 'operator', CURRENT_TIMESTAMP),
('manager1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaUKk7h.T0mUO', 'manager1@company.com', 'manager', CURRENT_TIMESTAMP),
('manager2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaUKk7h.T0mUO', 'manager2@company.com', 'manager', CURRENT_TIMESTAMP);

-- 2. 服务器表 (servers) Mock数据
INSERT INTO servers (server_name, ip_address, operating_system, cpu, memory, status, last_update, created_at, updated_at) VALUES
('web-server-01', '192.168.1.10', 'Ubuntu 22.04 LTS', 'Intel Xeon E5-2680v4 2.40GHz', '32GB DDR4', 'online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('web-server-02', '192.168.1.11', 'CentOS 8', 'Intel Xeon E5-2670 2.60GHz', '16GB DDR4', 'online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('db-server-01', '192.168.1.20', 'Ubuntu 20.04 LTS', 'Intel Xeon Gold 6248 2.50GHz', '64GB DDR4', 'online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('db-server-02', '192.168.1.21', 'Red Hat Enterprise Linux 8', 'Intel Xeon Platinum 8260 2.40GHz', '128GB DDR4', 'maintenance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('app-server-01', '192.168.1.30', 'Windows Server 2019', 'Intel Xeon E5-2690v3 2.60GHz', '32GB DDR4', 'online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('app-server-02', '192.168.1.31', 'Ubuntu 22.04 LTS', 'AMD EPYC 7402P 2.80GHz', '64GB DDR4', 'offline', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cache-server-01', '192.168.1.40', 'Ubuntu 20.04 LTS', 'Intel Xeon E5-2650v4 2.20GHz', '16GB DDR4', 'online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('load-balancer-01', '192.168.1.5', 'CentOS 7', 'Intel Xeon E5-2620v3 2.40GHz', '8GB DDR4', 'online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. 项目表 (projects) Mock数据
INSERT INTO projects (project_name, status, duration, created_at, updated_at) VALUES
('E-commerce Platform', 'active', 180, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mobile Banking App', 'active', 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Data Analytics Dashboard', 'planning', 90, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Customer CRM System', 'completed', 240, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('IoT Monitoring Platform', 'active', 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. 项目成员表 (project_members) Mock数据
INSERT INTO project_members (project_id, user_id, created_at, updated_at) VALUES
(1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- admin参与电商平台
(1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- operator1参与电商平台
(1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- manager1参与电商平台
(2, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- operator2参与移动银行
(2, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- manager2参与移动银行
(3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- admin参与数据分析
(3, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- operator1参与数据分析
(4, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- manager1参与CRM系统
(5, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- operator2参与IoT平台
(5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); -- admin参与IoT平台

-- 5. 告警规则表 (alert_rule) Mock数据
INSERT INTO alert_rule (rule_name, target_metric, comparator, threshold, duration, severity, enabled, server_id, created_at, updated_at) VALUES
('CPU Usage High - Web Server 01', 'cpu_usage', 'GT', 85.0, 5, 'high', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Memory Usage High - DB Server 01', 'memory_usage', 'GT', 90.0, 10, 'critical', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Disk Usage High - App Server 01', 'disk_usage', 'GT', 80.0, 15, 'medium', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CPU Usage High - DB Server 02', 'cpu_usage', 'GT', 80.0, 5, 'high', false, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- 禁用的规则
('Network In High - Load Balancer', 'network_in', 'GT', 1000.0, 3, 'medium', true, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Temperature High - Cache Server', 'temperature', 'GT', 75.0, 2, 'high', true, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Load Average High - App Server 02', 'load_avg', 'GT', 5.0, 8, 'medium', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Memory Usage High - Web Server 02', 'memory_usage', 'GT', 85.0, 10, 'high', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. 告警事件表 (alert_event) Mock数据
INSERT INTO alert_event (rule_id, server_id, status, started_at, triggered_value, summary, created_at) VALUES
(1, 1, 'active', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 92.5, 'CPU usage exceeded threshold: 92.5%', CURRENT_TIMESTAMP),
(2, 3, 'resolved', DATEADD('DAY', -1, CURRENT_TIMESTAMP), 95.2, 'Memory usage critical: 95.2%', DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
(3, 5, 'active', DATEADD('MINUTE', -30, CURRENT_TIMESTAMP), 87.3, 'Disk usage high: 87.3%', CURRENT_TIMESTAMP),
(5, 8, 'resolved', DATEADD('HOUR', -3, CURRENT_TIMESTAMP), 1250.0, 'Network traffic spike: 1250 MB/s', DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
(6, 7, 'active', DATEADD('MINUTE', -15, CURRENT_TIMESTAMP), 78.2, 'Server temperature warning: 78.2°C', CURRENT_TIMESTAMP),
(8, 2, 'resolved', DATEADD('DAY', -2, CURRENT_TIMESTAMP), 89.1, 'Memory usage alert: 89.1%', DATEADD('DAY', -2, CURRENT_TIMESTAMP));

-- 更新已解决事件的resolved_at时间
UPDATE alert_event SET resolved_at = DATEADD('HOUR', -23, CURRENT_TIMESTAMP) WHERE status = 'resolved' AND rule_id = 2;
UPDATE alert_event SET resolved_at = DATEADD('HOUR', -2, CURRENT_TIMESTAMP) WHERE status = 'resolved' AND rule_id = 5;
UPDATE alert_event SET resolved_at = DATEADD('DAY', -1, CURRENT_TIMESTAMP) WHERE status = 'resolved' AND rule_id = 8;

-- 7. 服务器指标表 (server_metrics) Mock数据
-- 为每个服务器创建最近24小时的指标数据
-- 服务器01 (Web Server 01) - 最近24小时数据
INSERT INTO server_metrics (server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, load_avg, temperature, collected_at) VALUES
(1, 45.2, 67.8, 52.3, 234.5, 189.2, 2.1, 65.4, DATEADD('HOUR', -23, CURRENT_TIMESTAMP)),
(1, 52.1, 71.2, 52.3, 267.8, 201.5, 2.3, 66.1, DATEADD('HOUR', -22, CURRENT_TIMESTAMP)),
(1, 78.9, 75.6, 52.4, 345.7, 278.3, 3.2, 68.7, DATEADD('HOUR', -21, CURRENT_TIMESTAMP)),
(1, 85.4, 78.1, 52.5, 398.2, 312.8, 3.8, 70.2, DATEADD('HOUR', -20, CURRENT_TIMESTAMP)),
(1, 92.5, 82.3, 52.6, 456.7, 367.9, 4.1, 72.1, DATEADD('HOUR', -19, CURRENT_TIMESTAMP)),
(1, 88.7, 79.8, 52.7, 423.4, 341.2, 3.9, 71.3, DATEADD('HOUR', -18, CURRENT_TIMESTAMP)),
(1, 76.3, 74.2, 52.8, 378.9, 298.7, 3.4, 69.8, DATEADD('HOUR', -17, CURRENT_TIMESTAMP)),
(1, 68.9, 71.5, 52.9, 321.4, 256.3, 3.0, 68.2, DATEADD('HOUR', -16, CURRENT_TIMESTAMP)),
(1, 59.7, 69.8, 53.0, 289.5, 223.4, 2.7, 67.1, DATEADD('HOUR', -15, CURRENT_TIMESTAMP)),
(1, 51.3, 67.2, 53.1, 256.7, 198.9, 2.4, 66.3, DATEADD('HOUR', -14, CURRENT_TIMESTAMP)),
(1, 48.9, 66.1, 53.2, 245.8, 187.6, 2.2, 65.8, DATEADD('HOUR', -13, CURRENT_TIMESTAMP)),
(1, 46.7, 65.8, 53.3, 238.2, 182.3, 2.1, 65.5, DATEADD('HOUR', -12, CURRENT_TIMESTAMP)),
(1, 44.2, 65.3, 53.4, 231.7, 178.9, 2.0, 65.2, DATEADD('HOUR', -11, CURRENT_TIMESTAMP)),
(1, 47.8, 66.7, 53.5, 242.3, 185.4, 2.2, 65.7, DATEADD('HOUR', -10, CURRENT_TIMESTAMP)),
(1, 53.4, 68.9, 53.6, 271.2, 206.8, 2.5, 66.4, DATEADD('HOUR', -9, CURRENT_TIMESTAMP)),
(1, 61.2, 71.3, 53.7, 312.5, 241.7, 2.8, 67.3, DATEADD('HOUR', -8, CURRENT_TIMESTAMP)),
(1, 69.8, 73.8, 53.8, 356.7, 278.9, 3.1, 68.1, DATEADD('HOUR', -7, CURRENT_TIMESTAMP)),
(1, 74.5, 76.2, 53.9, 382.3, 298.4, 3.3, 68.9, DATEADD('HOUR', -6, CURRENT_TIMESTAMP)),
(1, 79.3, 78.1, 54.0, 401.7, 315.2, 3.6, 69.7, DATEADD('HOUR', -5, CURRENT_TIMESTAMP)),
(1, 83.2, 79.8, 54.1, 418.9, 329.6, 3.8, 70.4, DATEADD('HOUR', -4, CURRENT_TIMESTAMP)),
(1, 87.6, 81.2, 54.2, 437.3, 344.1, 4.0, 71.2, DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
(1, 90.1, 82.7, 54.3, 451.8, 356.7, 4.2, 71.8, DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
(1, 88.9, 81.5, 54.4, 445.2, 351.3, 4.1, 71.5, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(1, 86.7, 80.3, 54.5, 432.1, 342.8, 3.9, 70.9, CURRENT_TIMESTAMP);

-- 服务器02 (Web Server 02) - 最近12小时数据
INSERT INTO server_metrics (server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, load_avg, temperature, collected_at) VALUES
(2, 38.5, 58.2, 41.7, 187.3, 145.6, 1.8, 62.1, DATEADD('HOUR', -11, CURRENT_TIMESTAMP)),
(2, 42.1, 61.3, 41.8, 203.4, 158.7, 2.0, 63.2, DATEADD('HOUR', -10, CURRENT_TIMESTAMP)),
(2, 47.8, 64.9, 41.9, 234.5, 182.3, 2.3, 64.8, DATEADD('HOUR', -9, CURRENT_TIMESTAMP)),
(2, 52.3, 67.1, 42.0, 267.8, 206.9, 2.6, 66.1, DATEADD('HOUR', -8, CURRENT_TIMESTAMP)),
(2, 49.7, 65.8, 42.1, 251.2, 194.7, 2.4, 65.3, DATEADD('HOUR', -7, CURRENT_TIMESTAMP)),
(2, 45.9, 63.2, 42.2, 228.6, 176.8, 2.2, 64.7, DATEADD('HOUR', -6, CURRENT_TIMESTAMP)),
(2, 41.3, 60.7, 42.3, 209.3, 161.2, 2.0, 63.8, DATEADD('HOUR', -5, CURRENT_TIMESTAMP)),
(2, 39.8, 59.4, 42.4, 198.7, 152.9, 1.9, 63.1, DATEADD('HOUR', -4, CURRENT_TIMESTAMP)),
(2, 43.2, 62.1, 42.5, 217.8, 168.4, 2.1, 64.3, DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
(2, 48.6, 65.7, 42.6, 245.3, 189.7, 2.4, 65.9, DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
(2, 51.9, 67.8, 42.7, 263.1, 203.2, 2.6, 66.8, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(2, 47.3, 64.2, 42.8, 238.9, 184.6, 2.3, 65.4, CURRENT_TIMESTAMP);

-- 服务器03 (DB Server 01) - 最近8小时数据
INSERT INTO server_metrics (server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, load_avg, temperature, collected_at) VALUES
(3, 72.3, 89.1, 78.5, 445.2, 523.7, 5.2, 73.8, DATEADD('HOUR', -7, CURRENT_TIMESTAMP)),
(3, 75.8, 91.3, 78.6, 467.3, 548.2, 5.5, 74.6, DATEADD('HOUR', -6, CURRENT_TIMESTAMP)),
(3, 78.9, 93.2, 78.7, 489.7, 571.8, 5.8, 75.3, DATEADD('HOUR', -5, CURRENT_TIMESTAMP)),
(3, 81.2, 95.1, 78.8, 512.3, 596.4, 6.1, 76.1, DATEADD('HOUR', -4, CURRENT_TIMESTAMP)),
(3, 83.7, 96.8, 78.9, 534.8, 621.7, 6.4, 76.8, DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
(3, 86.1, 98.2, 79.0, 556.2, 645.3, 6.7, 77.5, DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
(3, 88.4, 99.1, 79.1, 578.9, 668.7, 7.0, 78.2, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(3, 85.3, 97.5, 79.2, 561.4, 652.8, 6.8, 77.6, CURRENT_TIMESTAMP);

-- 服务器04 (DB Server 02) - 维护状态，最近4小时数据
INSERT INTO server_metrics (server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, load_avg, temperature, collected_at) VALUES
(4, 23.1, 34.2, 28.7, 89.3, 76.8, 1.2, 58.3, DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
(4, 25.7, 36.8, 28.8, 94.1, 81.2, 1.3, 59.1, DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
(4, 28.3, 39.4, 28.9, 98.7, 85.6, 1.4, 59.8, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(4, 26.9, 37.6, 29.0, 96.2, 83.4, 1.3, 59.5, CURRENT_TIMESTAMP);

-- 服务器05 (App Server 01) - 最近6小时数据
INSERT INTO server_metrics (server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, load_avg, temperature, collected_at) VALUES
(5, 56.7, 72.3, 68.4, 312.5, 287.3, 3.4, 68.9, DATEADD('HOUR', -5, CURRENT_TIMESTAMP)),
(5, 61.2, 75.8, 68.5, 334.7, 306.2, 3.7, 70.1, DATEADD('HOUR', -4, CURRENT_TIMESTAMP)),
(5, 65.8, 78.9, 68.6, 356.3, 325.8, 4.0, 71.3, DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
(5, 69.4, 81.2, 68.7, 378.9, 345.1, 4.3, 72.5, DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
(5, 73.1, 84.6, 68.8, 401.2, 365.7, 4.6, 73.7, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(5, 70.8, 82.3, 68.9, 387.6, 354.2, 4.4, 72.9, CURRENT_TIMESTAMP);

-- 服务器06 (App Server 02) - 离线状态，最近2小时数据
INSERT INTO server_metrics (server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, load_avg, temperature, collected_at) VALUES
(6, 89.3, 87.2, 76.8, 234.1, 187.6, 6.8, 78.4, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(6, 91.7, 89.8, 77.0, 245.3, 198.2, 7.2, 79.1, CURRENT_TIMESTAMP);

-- 服务器07 (Cache Server 01) - 最近10小时数据
INSERT INTO server_metrics (server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, load_avg, temperature, collected_at) VALUES
(7, 34.2, 45.8, 38.9, 156.7, 134.2, 2.1, 61.8, DATEADD('HOUR', -9, CURRENT_TIMESTAMP)),
(7, 37.8, 48.3, 39.0, 172.4, 147.8, 2.3, 62.9, DATEADD('HOUR', -8, CURRENT_TIMESTAMP)),
(7, 41.5, 51.7, 39.1, 189.3, 162.1, 2.5, 64.2, DATEADD('HOUR', -7, CURRENT_TIMESTAMP)),
(7, 45.2, 54.9, 39.2, 206.8, 176.7, 2.7, 65.4, DATEADD('HOUR', -6, CURRENT_TIMESTAMP)),
(7, 42.7, 52.3, 39.3, 194.5, 165.8, 2.6, 64.7, DATEADD('HOUR', -5, CURRENT_TIMESTAMP)),
(7, 39.4, 49.8, 39.4, 183.2, 156.3, 2.4, 63.8, DATEADD('HOUR', -4, CURRENT_TIMESTAMP)),
(7, 36.8, 47.1, 39.5, 171.7, 146.9, 2.2, 62.6, DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
(7, 40.3, 50.6, 39.6, 188.4, 161.2, 2.4, 64.1, DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
(7, 43.9, 53.8, 39.7, 205.7, 175.8, 2.6, 65.3, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(7, 41.2, 51.4, 39.8, 192.8, 164.7, 2.5, 64.6, CURRENT_TIMESTAMP);

-- 服务器08 (Load Balancer 01) - 最近16小时数据
INSERT INTO server_metrics (server_id, cpu_usage, memory_usage, disk_usage, network_in, network_out, load_avg, temperature, collected_at) VALUES
(8, 28.7, 42.3, 35.1, 445.2, 387.6, 1.9, 59.7, DATEADD('HOUR', -15, CURRENT_TIMESTAMP)),
(8, 31.4, 44.8, 35.2, 467.3, 406.2, 2.1, 60.8, DATEADD('HOUR', -14, CURRENT_TIMESTAMP)),
(8, 34.9, 47.6, 35.3, 489.7, 425.8, 2.3, 62.1, DATEADD('HOUR', -13, CURRENT_TIMESTAMP)),
(8, 38.2, 50.4, 35.4, 512.3, 445.1, 2.5, 63.4, DATEADD('HOUR', -12, CURRENT_TIMESTAMP)),
(8, 41.7, 53.8, 35.5, 534.8, 464.7, 2.7, 64.8, DATEADD('HOUR', -11, CURRENT_TIMESTAMP)),
(8, 39.3, 51.2, 35.6, 521.6, 453.8, 2.6, 64.1, DATEADD('HOUR', -10, CURRENT_TIMESTAMP)),
(8, 36.8, 48.7, 35.7, 508.4, 442.9, 2.4, 63.5, DATEADD('HOUR', -9, CURRENT_TIMESTAMP)),
(8, 33.2, 45.9, 35.8, 495.2, 432.1, 2.2, 62.8, DATEADD('HOUR', -8, CURRENT_TIMESTAMP)),
(8, 30.7, 43.4, 35.9, 482.1, 421.3, 2.0, 61.9, DATEADD('HOUR', -7, CURRENT_TIMESTAMP)),
(8, 33.8, 46.7, 36.0, 501.7, 437.8, 2.3, 62.7, DATEADD('HOUR', -6, CURRENT_TIMESTAMP)),
(8, 37.4, 49.8, 36.1, 523.4, 456.2, 2.5, 64.0, DATEADD('HOUR', -5, CURRENT_TIMESTAMP)),
(8, 40.9, 52.6, 36.2, 545.8, 475.7, 2.7, 65.3, DATEADD('HOUR', -4, CURRENT_TIMESTAMP)),
(8, 38.7, 50.1, 36.3, 532.6, 464.9, 2.6, 64.7, DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
(8, 35.1, 47.3, 36.4, 519.4, 454.1, 2.4, 63.9, DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
(8, 32.6, 44.8, 36.5, 506.3, 443.2, 2.2, 63.2, DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
(8, 35.9, 47.9, 36.6, 525.8, 459.7, 2.4, 64.1, CURRENT_TIMESTAMP);

-- 添加项目与服务器关联数据 (project_servers 关联表)
-- 电商平台关联Web服务器和DB服务器
INSERT INTO project_servers (project_id, server_id) VALUES
(1, 1), -- 电商平台 -> Web Server 01
(1, 2), -- 电商平台 -> Web Server 02
(1, 3), -- 电商平台 -> DB Server 01
(2, 5), -- 移动银行 -> App Server 01
(2, 8), -- 移动银行 -> Load Balancer
(3, 1), -- 数据分析 -> Web Server 01
(3, 3), -- 数据分析 -> DB Server 01
(4, 5), -- CRM系统 -> App Server 01
(5, 1), -- IoT平台 -> Web Server 01
(5, 7); -- IoT平台 -> Cache Server

-- 添加索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_server_metrics_server_id ON server_metrics(server_id);
CREATE INDEX IF NOT EXISTS idx_server_metrics_collected_at ON server_metrics(collected_at);
CREATE INDEX IF NOT EXISTS idx_alert_event_server_id ON alert_event(server_id);
CREATE INDEX IF NOT EXISTS idx_alert_event_status ON alert_event(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_servers_project_id ON project_servers(project_id);
CREATE INDEX IF NOT EXISTS idx_project_servers_server_id ON project_servers(server_id);

-- Mock数据插入完成
-- 总计数据量：
-- users: 5条
-- servers: 8条  
-- projects: 5条
-- project_members: 10条
-- alert_rule: 8条
-- alert_event: 6条
-- server_metrics: 96条
-- project_servers: 11条
-- 总计: 149条记录