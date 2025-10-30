package com.elec5619.backend.entity;

import java.time.LocalDateTime;

/**
 * 完全不依赖Spring的实体类测试主类
 * 直接在main方法中测试AlertRule和AlertEvent的方法调用
 */
public class AlertEntityMainTest {
    
    public static void main(String[] args) {
        System.out.println("======= 开始测试实体类方法调用 =======");
        
        // 测试AlertRule实体类
        testAlertRuleMethods();
        
        // 测试AlertEvent实体类
        testAlertEventMethods();
        
        // 测试实体类关系
        testEntityRelationships();
        
        System.out.println("======= 所有测试完成 =======");
        System.exit(0); // 正常退出
    }
    
    /**
     * 测试AlertRule实体类的方法调用
     */
    private static void testAlertRuleMethods() {
        System.out.println("\n1. 测试AlertRule实体类方法调用:");
        
        try {
            // 创建AlertRule实例
            AlertRule rule = new AlertRule();
            
            // 测试setter方法
            rule.setRuleName("CPU使用率过高测试");
            rule.setTargetMetric("cpu_usage");
            rule.setThreshold(90.0);
            rule.setComparator(">=");
            rule.setSeverity("high");
            rule.setDuration(60);
            rule.setEnabled(true);
            rule.setServerId(1L);
            rule.setDescription("当CPU使用率持续60秒超过90%时触发告警");
            
            // 测试getter方法并输出结果
            System.out.println("   ✓ Rule Name: " + rule.getRuleName());
            System.out.println("   ✓ Target Metric: " + rule.getTargetMetric());
            System.out.println("   ✓ Threshold: " + rule.getThreshold());
            System.out.println("   ✓ Comparator: " + rule.getComparator());
            System.out.println("   ✓ Severity: " + rule.getSeverity());
            System.out.println("   ✓ Duration: " + rule.getDuration());
            System.out.println("   ✓ Enabled: " + rule.getEnabled());
            System.out.println("   ✓ Server ID: " + rule.getServerId());
            System.out.println("   ✓ Description: " + rule.getDescription());
            
            // 验证所有getter方法返回正确的值
            boolean allTestsPassed = 
                "CPU使用率过高测试".equals(rule.getRuleName()) &&
                "cpu_usage".equals(rule.getTargetMetric()) &&
                90.0 == rule.getThreshold() &&
                ">=".equals(rule.getComparator()) &&
                "high".equals(rule.getSeverity()) &&
                60 == rule.getDuration() &&
                Boolean.TRUE.equals(rule.getEnabled()) &&
                1L == rule.getServerId() &&
                "当CPU使用率持续60秒超过90%时触发告警".equals(rule.getDescription());
            
            if (allTestsPassed) {
                System.out.println("✅ AlertRule实体类方法调用测试通过！");
            } else {
                System.out.println("❌ AlertRule实体类方法调用测试失败！");
            }
        } catch (Exception e) {
            System.out.println("❌ AlertRule实体类测试发生异常: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 测试AlertEvent实体类的方法调用
     */
    private static void testAlertEventMethods() {
        System.out.println("\n2. 测试AlertEvent实体类方法调用:");
        
        try {
            // 创建AlertRule和AlertEvent实例
            AlertRule rule = new AlertRule();
            rule.setRuleName("内存使用率过高测试");
            rule.setServerId(1L);
            rule.setServerId(1L);
            
            AlertEvent event = new AlertEvent();
            
            // 测试setter方法
            event.setAlertRule(rule);
            event.setServerId(1L);
            event.setStatus("firing");
            LocalDateTime startTime = LocalDateTime.now().minusMinutes(5);
            event.setStartedAt(startTime);
            event.setTriggeredValue(85.5);
            event.setSummary("内存使用率达到85.5%，超过阈值80%");
            
            // 测试getter方法并输出结果
            System.out.println("   ✓ AlertRule Name: " + event.getAlertRule().getRuleName());
            System.out.println("   ✓ Server ID: " + rule.getServerId());
            System.out.println("   ✓ Status: " + event.getStatus());
            System.out.println("   ✓ Started At: " + event.getStartedAt());
            System.out.println("   ✓ Triggered Value: " + event.getTriggeredValue());
            System.out.println("   ✓ Summary: " + event.getSummary());
            System.out.println("   ✓ Resolved At: " + event.getResolvedAt()); // 应该是null
            
            // 标记为已解决
            event.setStatus("resolved");
            LocalDateTime endTime = LocalDateTime.now();
            event.setResolvedAt(endTime);
            
            System.out.println("   ✓ Updated Status: " + event.getStatus());
            System.out.println("   ✓ Updated Resolved At: " + event.getResolvedAt());
            
            // 验证所有getter方法返回正确的值
            boolean allTestsPassed = 
                rule.equals(event.getAlertRule()) &&
                1L == event.getServerId() &&
                "resolved".equals(event.getStatus()) &&
                85.5 == event.getTriggeredValue() &&
                "内存使用率达到85.5%，超过阈值80%".equals(event.getSummary()) &&
                event.getResolvedAt() != null;
            
            if (allTestsPassed) {
                System.out.println("✅ AlertEvent实体类方法调用测试通过！");
            } else {
                System.out.println("❌ AlertEvent实体类方法调用测试失败！");
            }
        } catch (Exception e) {
            System.out.println("❌ AlertEvent实体类测试发生异常: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 测试实体类之间的关系
     */
    private static void testEntityRelationships() {
        System.out.println("\n3. 测试实体类关系:");
        
        try {
            AlertRule rule = new AlertRule();
            rule.setRuleName("关系测试规则");
            
            AlertEvent event = new AlertEvent();
            event.setAlertRule(rule);
            
            // 验证关系是否正确设置
            System.out.println("   ✓ 设置关系后 - AlertRule Name: " + event.getAlertRule().getRuleName());
            
            // 测试更新关系
            AlertRule newRule = new AlertRule();
            newRule.setRuleName("新的关系测试规则");
            event.setAlertRule(newRule);
            
            // 验证关系更新是否正确
            System.out.println("   ✓ 更新关系后 - AlertRule Name: " + event.getAlertRule().getRuleName());
            
            // 验证关系是否正确更新
            boolean allTestsPassed = 
                "新的关系测试规则".equals(event.getAlertRule().getRuleName()) &&
                newRule.equals(event.getAlertRule());
            
            if (allTestsPassed) {
                System.out.println("✅ 实体类关系测试通过！");
            } else {
                System.out.println("❌ 实体类关系测试失败！");
            }
        } catch (Exception e) {
            System.out.println("❌ 实体类关系测试发生异常: " + e.getMessage());
            e.printStackTrace();
        }
    }
}