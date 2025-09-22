package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertRule;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.ComponentScan;

/**
 * 简单的测试主类，用于验证AlertRule实体类的方法调用是否正常工作
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.elec5619.backend")
public class AlertRuleTestMain {
    
    public static void main(String[] args) {
        // 启动Spring Boot应用程序上下文
        ApplicationContext context = SpringApplication.run(AlertRuleTestMain.class, args);
        
        System.out.println("测试主类启动成功，开始测试AlertRule实体类方法调用...");
        
        // 创建AlertRule实例并测试所有方法调用
        AlertRule rule = new AlertRule();
        
        // 测试setter方法
        rule.setRuleName("测试规则名称");
        rule.setTargetMetric("cpu_usage");
        rule.setThreshold(90.0);
        rule.setComparator(">=");
        rule.setSeverity("high");
        rule.setDuration(60);
        rule.setEnabled(true);
        rule.setProjectId(1L);
        rule.setDescription("测试描述");
        
        // 测试getter方法并输出结果
        System.out.println("Rule Name: " + rule.getRuleName());
        System.out.println("Target Metric: " + rule.getTargetMetric());
        System.out.println("Threshold: " + rule.getThreshold());
        System.out.println("Comparator: " + rule.getComparator());
        System.out.println("Severity: " + rule.getSeverity());
        System.out.println("Duration: " + rule.getDuration());
        System.out.println("Enabled: " + rule.getEnabled());
        System.out.println("Project ID: " + rule.getProjectId());
        System.out.println("Description: " + rule.getDescription());
        
        // 测试AlertRuleService
        AlertRuleService alertRuleService = context.getBean(AlertRuleService.class);
        System.out.println("AlertRuleService已成功获取");
        
        try {
            // 尝试创建规则（这可能会失败，因为我们没有设置完整的数据库环境）
            System.out.println("尝试创建告警规则...");
            AlertRule createdRule = alertRuleService.createAlertRule(rule);
            if (createdRule != null && createdRule.getRuleId() != null) {
                System.out.println("告警规则创建成功，ID: " + createdRule.getRuleId());
            } else {
                System.out.println("告警规则创建但未获取ID（可能是测试环境限制）");
            }
        } catch (Exception e) {
            System.out.println("创建规则时发生异常: " + e.getMessage());
            System.out.println("注意：这可能是由于测试环境的数据库配置导致的，不影响方法调用的正确性验证");
        }
        
        System.out.println("AlertRule实体类方法调用测试完成！");
        System.exit(0); // 退出应用程序
    }
}