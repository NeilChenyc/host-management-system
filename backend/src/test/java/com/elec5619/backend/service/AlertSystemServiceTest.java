package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.repository.ServerMetricsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AlertSystemService
 */
@ExtendWith(MockitoExtension.class)
class AlertSystemServiceTest {

    @Mock
    private AlertRuleService alertRuleService;

    @Mock
    private AlertEventService alertEventService;

    @Mock
    private ServerMetricsRepository serverMetricsRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AlertSystemService alertSystemService;

    private AlertRule testAlertRule;
    private ServerMetrics testMetrics;
    private AlertEvent testAlertEvent;

    @BeforeEach
    void setUp() {
        // Setup test alert rule
        testAlertRule = new AlertRule();
        testAlertRule.setRuleId(1L);
        testAlertRule.setRuleName("High CPU Usage");
        testAlertRule.setTargetMetric("cpuUsage");
        testAlertRule.setComparator("GREATER_THAN");
        testAlertRule.setThreshold(80.0);
        testAlertRule.setDuration(1);
        testAlertRule.setSeverity("CRITICAL");
        testAlertRule.setEnabled(true);

        // Setup test metrics
        testMetrics = new ServerMetrics();
        testMetrics.setMetricId(1L);
        testMetrics.setServerId(1L);
        testMetrics.setCpuUsage(85.0);
        testMetrics.setMemoryUsage(60.0);
        testMetrics.setDiskUsage(45.0);
        testMetrics.setNetworkIn(100.0);
        testMetrics.setNetworkOut(200.0);
        testMetrics.setCollectedAt(LocalDateTime.now());

        // Setup test alert event
        testAlertEvent = new AlertEvent();
        testAlertEvent.setEventId(1L);
        testAlertEvent.setAlertRule(testAlertRule);
        testAlertEvent.setServerId(1L);
        testAlertEvent.setSummary("CPU usage exceeded threshold");
        testAlertEvent.setStatus("ACTIVE");
        testAlertEvent.setStartedAt(LocalDateTime.now());
    }

    @Test
    void testEvaluateMetrics_TriggeredAlert() {
        // Given
        Long serverId = 1L;
        List<AlertRule> enabledRules = Arrays.asList(testAlertRule);
        List<ServerMetrics> recentMetrics = Arrays.asList(testMetrics);

        when(alertRuleService.getEnabledAlertRules()).thenReturn(enabledRules);
        when(serverMetricsRepository.findByServerIdAndCollectedAtAfterOrderByCollectedAtDesc(
                eq(serverId), any(LocalDateTime.class))).thenReturn(recentMetrics);
        when(alertEventService.createAlertEvent(any(AlertEvent.class))).thenReturn(testAlertEvent);

        // When
        List<AlertEvent> result = alertSystemService.evaluateMetrics(serverId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("High CPU Usage", result.get(0).getAlertRule().getRuleName());
        assertEquals("CRITICAL", result.get(0).getAlertRule().getSeverity());

        verify(alertRuleService, times(1)).getEnabledAlertRules();
        verify(serverMetricsRepository, times(1)).findByServerIdAndCollectedAtAfterOrderByCollectedAtDesc(
                eq(serverId), any(LocalDateTime.class));
        verify(alertEventService, times(1)).createAlertEvent(any(AlertEvent.class));
        verify(notificationService, times(1)).sendAlertNotifications(any());
    }

    @Test
    void testEvaluateMetrics_NoTriggeredAlert() {
        // Given
        Long serverId = 1L;
        testMetrics.setCpuUsage(50.0); // Below threshold
        List<AlertRule> enabledRules = Arrays.asList(testAlertRule);
        List<ServerMetrics> recentMetrics = Arrays.asList(testMetrics);

        when(alertRuleService.getEnabledAlertRules()).thenReturn(enabledRules);
        when(serverMetricsRepository.findByServerIdAndCollectedAtAfterOrderByCollectedAtDesc(
                eq(serverId), any(LocalDateTime.class))).thenReturn(recentMetrics);

        // When
        List<AlertEvent> result = alertSystemService.evaluateMetrics(serverId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(alertRuleService, times(1)).getEnabledAlertRules();
        verify(serverMetricsRepository, times(1)).findByServerIdAndCollectedAtAfterOrderByCollectedAtDesc(
                eq(serverId), any(LocalDateTime.class));
        verify(alertEventService, never()).createAlertEvent(any());
        verify(notificationService, never()).sendAlertNotifications(any());
    }

    @Test
    void testEvaluateMetrics_NoEnabledRules() {
        // Given
        Long serverId = 1L;
        List<AlertRule> enabledRules = Arrays.asList(); // Empty list

        when(alertRuleService.getEnabledAlertRules()).thenReturn(enabledRules);

        // When
        List<AlertEvent> result = alertSystemService.evaluateMetrics(serverId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(alertRuleService, times(1)).getEnabledAlertRules();
        verify(serverMetricsRepository, never()).findByServerIdAndCollectedAtAfterOrderByCollectedAtDesc(any(), any());
        verify(alertEventService, never()).createAlertEvent(any());
        verify(notificationService, never()).sendAlertNotifications(any());
    }

    @Test
    void testEvaluateMetrics_NoRecentMetrics() {
        // Given
        Long serverId = 1L;
        List<AlertRule> enabledRules = Arrays.asList(testAlertRule);
        List<ServerMetrics> recentMetrics = Arrays.asList(); // Empty list

        when(alertRuleService.getEnabledAlertRules()).thenReturn(enabledRules);
        when(serverMetricsRepository.findByServerIdAndCollectedAtAfterOrderByCollectedAtDesc(
                eq(serverId), any(LocalDateTime.class))).thenReturn(recentMetrics);

        // When
        List<AlertEvent> result = alertSystemService.evaluateMetrics(serverId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(alertRuleService, times(1)).getEnabledAlertRules();
        verify(serverMetricsRepository, times(1)).findByServerIdAndCollectedAtAfterOrderByCollectedAtDesc(
                eq(serverId), any(LocalDateTime.class));
        verify(alertEventService, never()).createAlertEvent(any());
        verify(notificationService, never()).sendAlertNotifications(any());
    }

    @Test
    void testEvaluateMetrics_NullServerId() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            alertSystemService.evaluateMetrics(null);
        });

        verify(alertRuleService, never()).getEnabledAlertRules();
        verify(serverMetricsRepository, never()).findByServerIdAndCollectedAtAfterOrderByCollectedAtDesc(any(), any());
        verify(alertEventService, never()).createAlertEvent(any());
        verify(notificationService, never()).sendAlertNotifications(any());
    }
}