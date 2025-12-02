package com.elec5619.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * Mock数据初始化器
 * 仅在本地开发环境（local profile）下执行
 * 自动导入mock数据到H2内存数据库
 */
@Component
@Profile("local")
public class MockDataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(MockDataInitializer.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info("开始初始化Mock数据...");
        
        try {
            // 检查是否已经有数据存在
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            if (userCount != null && userCount > 0) {
                logger.info("数据库中已存在数据，跳过Mock数据初始化");
                return;
            }
            
            // 读取mock数据SQL文件
            ClassPathResource resource = new ClassPathResource("mock-data.sql");
            if (!resource.exists()) {
                logger.warn("Mock数据文件不存在，跳过初始化");
                return;
            }
            
            String sqlContent;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                sqlContent = reader.lines().collect(Collectors.joining("\n"));
            }
            
            // 执行SQL脚本
            String[] sqlStatements = sqlContent.split(";");
            int executedCount = 0;
            
            for (String statement : sqlStatements) {
                String trimmedStatement = statement.trim();
                if (!trimmedStatement.isEmpty() && !trimmedStatement.startsWith("--")) {
                    try {
                        jdbcTemplate.execute(trimmedStatement);
                        executedCount++;
                    } catch (Exception e) {
                        logger.error("执行SQL语句失败: {}", trimmedStatement.substring(0, Math.min(100, trimmedStatement.length())), e);
                        // 继续执行下一条语句
                    }
                }
            }
            
            logger.info("Mock数据初始化完成，共执行 {} 条SQL语句", executedCount);
            
            // 验证数据导入结果
            validateDataImport();
            
        } catch (Exception e) {
            logger.error("Mock数据初始化失败", e);
            throw e;
        }
    }
    
    private void validateDataImport() {
        try {
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            Integer serverCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM servers", Integer.class);
            Integer projectCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM projects", Integer.class);
            Integer alertRuleCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM alert_rule", Integer.class);
            Integer alertEventCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM alert_event", Integer.class);
            Integer serverMetricsCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM server_metrics", Integer.class);
            Integer projectMemberCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM project_members", Integer.class);
            
            logger.info("数据验证结果:");
            logger.info("- 用户表: {} 条记录", userCount);
            logger.info("- 服务器表: {} 条记录", serverCount);
            logger.info("- 项目表: {} 条记录", projectCount);
            logger.info("- 告警规则表: {} 条记录", alertRuleCount);
            logger.info("- 告警事件表: {} 条记录", alertEventCount);
            logger.info("- 服务器指标表: {} 条记录", serverMetricsCount);
            logger.info("- 项目成员表: {} 条记录", projectMemberCount);
            
            // 检查数据完整性
            if (userCount != null && userCount > 0 && 
                serverCount != null && serverCount > 0 &&
                projectCount != null && projectCount > 0) {
                logger.info("✅ Mock数据导入成功，数据完整性验证通过");
            } else {
                logger.warn("⚠️  数据导入可能存在问题，部分表记录数为0");
            }
            
        } catch (Exception e) {
            logger.error("数据验证失败", e);
        }
    }
}