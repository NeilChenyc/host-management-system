-- 创建测试用户
INSERT INTO users (username, password_hash, email, role, created_at) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVh6Q5xK9QhxO4p3w4K9QhxO4p', 'admin@example.com', 'admin', NOW()),
('manager1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVh6Q5xK9QhxO4p3w4K9QhxO4p', 'manager1@example.com', 'manager', NOW()),
('user1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVh6Q5xK9QhxO4p3w4K9QhxO4p', 'user1@example.com', 'operation', NOW()),
('user2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVh6Q5xK9QhxO4p3w4K9QhxO4p', 'user2@example.com', 'operation', NOW()),
('user3', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVh6Q5xK9QhxO4p3w4K9QhxO4p', 'user3@example.com', 'operation', NOW());

-- 创建测试服务器
INSERT INTO servers (server_name, ip_address, operating_system, cpu, memory, status, created_at) VALUES
('Web Server 1', '192.168.1.10', 'Ubuntu 20.04', 'Intel i7', '16GB', 'active', NOW()),
('Database Server', '192.168.1.20', 'CentOS 8', 'Intel Xeon', '32GB', 'active', NOW()),
('App Server 1', '192.168.1.30', 'Windows Server 2019', 'AMD Ryzen', '8GB', 'active', NOW());
