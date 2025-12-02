-- 重置用户表并重新录入账号密码
-- 密码统一设置为: 123456

-- 清空现有用户数据
DELETE FROM users;

-- 重新插入用户数据，密码为123456 (BCrypt加密)
INSERT INTO users (username, password_hash, email, role, created_at) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaUKk7h.T0mUO', 'admin@company.com', 'admin', CURRENT_TIMESTAMP),
('operator1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaUKk7h.T0mUO', 'operator1@company.com', 'operator', CURRENT_TIMESTAMP),
('operator2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaUKk7h.T0mUO', 'operator2@company.com', 'operator', CURRENT_TIMESTAMP),
('manager1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaUKk7h.T0mUO', 'manager1@company.com', 'manager', CURRENT_TIMESTAMP),
('manager2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaUKk7h.T0mUO', 'manager2@company.com', 'manager', CURRENT_TIMESTAMP);