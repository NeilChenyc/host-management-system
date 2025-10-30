package com.elec5619.backend.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 简单的实体类单元测试，用于验证AlertRule和AlertEvent的方法调用是否正常工作
 * 这个测试不依赖Spring上下文和数据库
 */
public class AlertEntityTest {
    
    /**
     * 测试AlertRule实体类的方法调用
     */
    @Test
    public void testAlertRuleMethods() {
        // 创建AlertRule实例
        AlertRule rule = new AlertRule();
        
        // 测试setter方法
        rule.setRuleName("CPU使用率过高");
        rule.setTargetMetric("cpu_usage");
        rule.setThreshold(90.0);
        rule.setComparator(">=");
        rule.setSeverity("high");
        rule.setDuration(60);
        rule.setEnabled(true);
        rule.setServerId(1L);
        rule.setDescription("当CPU使用率持续60秒超过90%时触发告警");
        
        // 测试getter方法
        assertEquals("CPU使用率过高", rule.getRuleName());
        assertEquals("cpu_usage", rule.getTargetMetric());
        assertEquals(90.0, rule.getThreshold());
        assertEquals(">=", rule.getComparator());
        assertEquals("high", rule.getSeverity());
        assertEquals(60, rule.getDuration());
        assertTrue(rule.getEnabled());
        assertEquals(1L, rule.getServerId());
        assertEquals("当CPU使用率持续60秒超过90%时触发告警", rule.getDescription());
        
        // 测试setter方法的更新
        rule.setRuleName("内存使用率过高");
        rule.setTargetMetric("memory_usage");
        rule.setThreshold(80.0);
        rule.setComparator("<=");
        rule.setSeverity("medium");
        rule.setDuration(30);
        rule.setEnabled(false);
        rule.setServerId(2L);
        rule.setDescription("当内存使用率持续30秒低于80%时触发告警");
        
        // 测试更新后的getter方法
        assertEquals("内存使用率过高", rule.getRuleName());
        assertEquals("memory_usage", rule.getTargetMetric());
        assertEquals(80.0, rule.getThreshold());
        assertEquals("<=", rule.getComparator());
        assertEquals("medium", rule.getSeverity());
        assertEquals(30, rule.getDuration());
        assertFalse(rule.getEnabled());
        assertEquals(2L, rule.getServerId());
        assertEquals("当内存使用率持续30秒低于80%时触发告警", rule.getDescription());
        
        System.out.println("AlertRule实体类方法调用测试通过！");
    }
    
    /**
     * 测试AlertEvent实体类的方法调用
     */
    @Test
    public void testAlertEventMethods() {
        // 创建AlertRule和AlertEvent实例
        AlertRule rule = new AlertRule();
        rule.setRuleName("测试规则");
        rule.setServerId(1L);
        
        AlertEvent event = new AlertEvent();
        
        // 测试setter方法
        event.setAlertRule(rule);
        event.setServerId(101L);
        event.setStatus("firing");
        LocalDateTime startTime = LocalDateTime.now().minusMinutes(5);
        event.setStartedAt(startTime);
        event.setTriggeredValue(85.5);
        event.setSummary("测试告警摘要");
        
        // 测试getter方法
        assertEquals(rule, event.getAlertRule());
        assertEquals(101L, event.getServerId());
        assertEquals("firing", event.getStatus());
        assertEquals(startTime.getMinute(), event.getStartedAt().getMinute()); // 只比较分钟，避免时间精度问题
        assertEquals(85.5, event.getTriggeredValue());
        assertEquals("测试告警摘要", event.getSummary());
        assertNull(event.getResolvedAt()); // 初始状态应为null
        
        // 测试setter方法的更新
        event.setServerId(102L);
        event.setStatus("resolved");
        LocalDateTime endTime = LocalDateTime.now();
        event.setResolvedAt(endTime);
        event.setTriggeredValue(75.0);
        event.setSummary("已解决的告警摘要");
        
        // 测试更新后的getter方法
        assertEquals(102L, event.getServerId());
        assertEquals("resolved", event.getStatus());
        assertEquals(endTime.getMinute(), event.getResolvedAt().getMinute()); // 只比较分钟，避免时间精度问题
        assertEquals(75.0, event.getTriggeredValue());
        assertEquals("已解决的告警摘要", event.getSummary());
        
        System.out.println("AlertEvent实体类方法调用测试通过！");
    }
    
    /**
     * 测试实体类之间的关系
     */
    @Test
    public void testEntityRelationships() {
        // 创建实体类并设置关系
        AlertRule rule = new AlertRule();
        rule.setRuleName("关系测试规则");
        
        AlertEvent event = new AlertEvent();
        event.setAlertRule(rule);
        
        // 验证关系是否正确设置
        assertNotNull(event.getAlertRule());
        assertEquals("关系测试规则", event.getAlertRule().getRuleName());
        
        // 测试更新关系
        AlertRule newRule = new AlertRule();
        newRule.setRuleName("新的关系测试规则");
        event.setAlertRule(newRule);
        
        // 验证关系更新是否正确
        assertEquals("新的关系测试规则", event.getAlertRule().getRuleName());
        
        System.out.println("实体类关系测试通过！");
    }
}