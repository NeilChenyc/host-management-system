-- 删除 servers 表的 status 检查约束
-- 这将允许任何 status 值，包括小写的 'unknown', 'online', 'offline', 'maintenance'

-- 首先检查约束是否存在
DO $$
BEGIN
    -- 尝试删除约束
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'servers_status_check' 
        AND table_name = 'servers'
    ) THEN
        ALTER TABLE servers DROP CONSTRAINT servers_status_check;
        RAISE NOTICE '约束 servers_status_check 已成功删除';
    ELSE
        RAISE NOTICE '约束 servers_status_check 不存在';
    END IF;
END $$;

-- 验证约束已被删除
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'servers' AND constraint_name LIKE '%status%';

