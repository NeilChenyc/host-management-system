package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.entity.AlertEvent;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Disabled;

/**
 * 简化版的告警系统测试类
 * 专注于验证实体类的方法调用，不依赖完整的数据库操作
 */
@Disabled("Disabled to avoid heavy ApplicationContext dependencies in unit test suite")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AlertSystemSimpleTest {

    /**
     * 测试AlertRule实体类的方法调用
     */
    @Test
    public void testAlertRuleMethods() {
        System.out.println("开始测试AlertRule实体类方法调用...");
        
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
        rule.setServerId(1L);
        rule.setDescription("当CPU使用率持续60秒超过90%时触发告警");
        
        // 测试getter方法
        assertEquals("CPU使用率过高测试", rule.getRuleName());
        assertEquals("cpu_usage", rule.getTargetMetric());
        assertEquals(90.0, rule.getThreshold());
        assertEquals(">=", rule.getComparator());
        assertEquals("high", rule.getSeverity());
        assertEquals(60, rule.getDuration());
        assertTrue(rule.getEnabled());
        assertEquals(1L, rule.getServerId());
        assertEquals("当CPU使用率持续60秒超过90%时触发告警", rule.getDescription());
        
        System.out.println("AlertRule实体类方法调用测试通过！");
    }
    
    /**
     * 测试AlertEvent实体类的方法调用
     */
    @Test
    public void testAlertEventMethods() {
        System.out.println("开始测试AlertEvent实体类方法调用...");
        
        // 创建AlertRule和AlertEvent实例
        AlertRule rule = new AlertRule();
        rule.setRuleName("内存使用率过高测试");
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
        
        // 测试getter方法
        assertEquals(rule, event.getAlertRule());
        assertEquals(1L, event.getServerId());
        assertEquals("firing", event.getStatus());
        assertEquals(startTime.getMinute(), event.getStartedAt().getMinute()); // 只比较分钟，避免时间精度问题
        assertEquals(85.5, event.getTriggeredValue());
        assertEquals("内存使用率达到85.5%，超过阈值80%", event.getSummary());
        assertNull(event.getResolvedAt());
        
        // 测试更新状态为已解决
        event.setStatus("resolved");
        LocalDateTime endTime = LocalDateTime.now();
        event.setResolvedAt(endTime);
        
        assertEquals("resolved", event.getStatus());
        assertEquals(endTime.getMinute(), event.getResolvedAt().getMinute()); // 只比较分钟，避免时间精度问题
        
        System.out.println("AlertEvent实体类方法调用测试通过！");
    }
    
    /**
     * 测试实体类之间的关系
     */
    @Test
    public void testEntityRelationships() {
        System.out.println("开始测试实体类关系...");
        
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