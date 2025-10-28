package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.repository.AlertRuleRepository;
import com.elec5619.backend.repository.AlertEventRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 告警系统功能测试类
 * 提供了告警规则和告警事件的核心功能测试
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AlertSystemTest {

    @Autowired
    private AlertRuleService alertRuleService;

    @Autowired
    private AlertEventService alertEventService;

    @Autowired
    private AlertRuleRepository alertRuleRepository;

    @Autowired
    private AlertEventRepository alertEventRepository;

    /**
     * 测试告警规则的创建、查询、更新和删除功能
     */
    @Test
    public void testAlertRuleCRUD() {
        // 创建告警规则
        AlertRule rule = new AlertRule();
        rule.setRuleName("CPU使用率过高测试");
        rule.setTargetMetric("cpu_usage");
        rule.setThreshold(90.0);
        rule.setComparator(">=");
        rule.setSeverity("high");
        rule.setDuration(60);
        rule.setEnabled(true);
        rule.setProjectId(1L);
        rule.setDescription("当CPU使用率持续60秒超过90%时触发告警");

        AlertRule createdRule = alertRuleService.createAlertRule(rule);
        assertNotNull(createdRule.getRuleId());
        assertEquals("CPU使用率过高测试", createdRule.getRuleName());

        // 查询告警规则
        Optional<AlertRule> foundRule = alertRuleService.getAlertRuleById(createdRule.getRuleId());
        assertTrue(foundRule.isPresent());
        assertEquals("CPU使用率过高测试", foundRule.get().getRuleName());

        // 更新告警规则
        foundRule.get().setThreshold(85.0);
        AlertRule updatedRule = alertRuleService.updateAlertRule(createdRule.getRuleId(), foundRule.get());
        assertEquals(85.0, updatedRule.getThreshold());

        // 按状态过滤规则
        List<AlertRule> enabledRules = alertRuleService.getAlertRulesByEnabled(true);
        assertFalse(enabledRules.isEmpty());

        // 按严重级别过滤规则
        List<AlertRule> highSeverityRules = alertRuleService.getAlertRulesBySeverity("high");
        assertFalse(highSeverityRules.isEmpty());

        // 按项目ID过滤规则
        List<AlertRule> projectRules = alertRuleService.getAlertRulesByProjectId(1L);
        assertFalse(projectRules.isEmpty());

        // 删除告警规则
        alertRuleService.deleteAlertRule(createdRule.getRuleId());
        Optional<AlertRule> deletedRule = alertRuleService.getAlertRuleById(createdRule.getRuleId());
        assertFalse(deletedRule.isPresent());
    }

    /**
     * 测试告警事件的创建、查询和更新功能
     */
    @Test
    public void testAlertEventManagement() {
        // 首先创建一个告警规则
        AlertRule rule = new AlertRule();
        rule.setRuleName("内存使用率过高测试");
        rule.setTargetMetric("memory_usage");
        rule.setThreshold(80.0);
        rule.setComparator(">=");
        rule.setSeverity("medium");
        rule.setDuration(30);
        rule.setEnabled(true);
        rule.setProjectId(1L);

        AlertRule createdRule = alertRuleService.createAlertRule(rule);

        // 创建告警事件
        AlertEvent event = new AlertEvent();
        event.setAlertRule(createdRule);
        event.setServerId(1L);
        event.setStatus("firing");
        event.setStartedAt(LocalDateTime.now().minusMinutes(5));
        event.setTriggeredValue(85.5);
        event.setSummary("内存使用率达到85.5%，超过阈值80%");

        AlertEvent createdEvent = alertEventService.createAlertEvent(event);
        assertNotNull(createdEvent.getEventId());
        assertEquals("firing", createdEvent.getStatus());

        // 查询告警事件
        Optional<AlertEvent> foundEvent = alertEventService.getAlertEventById(createdEvent.getEventId());
        assertTrue(foundEvent.isPresent());

        // 按规则ID查询事件
        List<AlertEvent> ruleEvents = alertEventService.getAlertEventsByRuleId(createdRule.getRuleId());
        assertFalse(ruleEvents.isEmpty());

        // 按服务器ID查询事件
        List<AlertEvent> serverEvents = alertEventService.getAlertEventsByServerId(1L);
        assertFalse(serverEvents.isEmpty());

        // 按状态查询事件
        List<AlertEvent> firingEvents = alertEventService.getAlertEventsByStatus("firing");
        assertFalse(firingEvents.isEmpty());

        // 按时间范围查询事件
        LocalDateTime startTime = LocalDateTime.now().minusHours(1);
        LocalDateTime endTime = LocalDateTime.now();
        List<AlertEvent> timeRangeEvents = alertEventService.getAlertEventsByTimeRange(startTime, endTime);
        assertFalse(timeRangeEvents.isEmpty());

        // 标记事件为已解决
        AlertEvent resolvedEvent = alertEventService.resolveAlertEvent(createdEvent.getEventId());
        assertEquals("resolved", resolvedEvent.getStatus());
        assertNotNull(resolvedEvent.getResolvedAt());

        // 多条件过滤查询
        List<AlertEvent> filteredEvents = alertEventService.getAlertEventsWithFilters(
                createdRule.getRuleId(), 1L, "resolved", startTime, endTime);
        assertFalse(filteredEvents.isEmpty());
    }

    /**
     * 测试告警规则名称唯一性验证
     */
    @Test
    public void testAlertRuleNameUniqueness() {
        // 创建第一个规则
        AlertRule rule1 = new AlertRule();
        rule1.setRuleName("测试唯一性规则");
        rule1.setTargetMetric("disk_space");
        rule1.setThreshold(90.0);
        rule1.setComparator(">=");
        rule1.setSeverity("high");
        rule1.setDuration(60);
        rule1.setEnabled(true);
        rule1.setProjectId(1L);

        AlertRule createdRule1 = alertRuleService.createAlertRule(rule1);
        assertNotNull(createdRule1.getRuleId());

        // 尝试创建同名规则，应该抛出异常
        AlertRule rule2 = new AlertRule();
        rule2.setRuleName("测试唯一性规则");
        rule2.setTargetMetric("disk_space");
        rule2.setThreshold(80.0);
        rule2.setComparator(">=");
        rule2.setSeverity("medium");
        rule2.setDuration(30);
        rule2.setEnabled(true);
        rule2.setProjectId(1L);

        assertThrows(IllegalArgumentException.class, () -> {
            alertRuleService.createAlertRule(rule2);
        });
    }
}