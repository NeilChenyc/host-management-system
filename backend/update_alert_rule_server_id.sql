-- 更新alert_rule表，将server_id列改为可空
-- 这样Alert规则就不需要强制绑定特定的服务器

ALTER TABLE alert_rule MODIFY COLUMN server_id BIGINT NULL;

-- 可选：为现有的没有server_id的规则设置为NULL
-- UPDATE alert_rule SET server_id = NULL WHERE server_id = 0;

-- 验证更改
DESCRIBE alert_rule;