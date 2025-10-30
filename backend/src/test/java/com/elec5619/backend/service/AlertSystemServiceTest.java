package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.repository.ServerMetricsRepository;
import com.elec5619.backend.service.impl.AlertSystemServiceImpl;
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
    private AlertSystemServiceImpl alertSystemService;

    private AlertRule testAlertRule;
    private ServerMetrics testMetrics;
    private AlertEvent testAlertEvent;

    @BeforeEach
    void setUp() {
        // Setup test alert rule
        testAlertRule = new AlertRule();
        testAlertRule.setRuleId(1L);
        testAlertRule.setRuleName("High CPU Usage");
        testAlertRule.setTargetMetric("cpu_usage");
        testAlertRule.setComparator(">");
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
        List<AlertRule> projectRules = Arrays.asList(testAlertRule);
        List<AlertRule> enabledRules = Arrays.asList(testAlertRule);

        when(serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(serverId)).thenReturn(testMetrics);
        when(alertRuleService.getAlertRulesByServerId(serverId)).thenReturn(projectRules);
        when(alertEventService.createAlertEvent(any(AlertEvent.class))).thenReturn(testAlertEvent);

        // When
        List<AlertEvent> result = alertSystemService.evaluateMetrics((Long) serverId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("High CPU Usage", result.get(0).getAlertRule().getRuleName());
        assertEquals("CRITICAL", result.get(0).getAlertRule().getSeverity());

        verify(serverMetricsRepository, times(1)).findTopByServerIdOrderByCollectedAtDesc(serverId);
        verify(alertRuleService, times(1)).getAlertRulesByServerId(serverId);
        verify(alertEventService, times(1)).createAlertEvent(any(AlertEvent.class));
        verify(notificationService, never()).sendAlertNotifications(any());
    }

    @Test
    void testEvaluateMetrics_NoTriggeredAlert() {
        // Given
        Long serverId = 1L;
        ServerMetrics lowCpuMetrics = new ServerMetrics();
        lowCpuMetrics.setMetricId(1L);
        lowCpuMetrics.setServerId(1L);
        lowCpuMetrics.setCpuUsage(50.0); // Below threshold
        lowCpuMetrics.setMemoryUsage(60.0);
        lowCpuMetrics.setDiskUsage(45.0);
        lowCpuMetrics.setNetworkIn(100.0);
        lowCpuMetrics.setNetworkOut(200.0);
        lowCpuMetrics.setCollectedAt(LocalDateTime.now());
        
        List<AlertRule> projectRules = Arrays.asList(testAlertRule);
        List<AlertRule> enabledRules = Arrays.asList(testAlertRule);

        when(serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(serverId)).thenReturn(lowCpuMetrics);
        when(alertRuleService.getAlertRulesByServerId(serverId)).thenReturn(projectRules);
        // no event expected, do not stub create

        // When
        List<AlertEvent> result = alertSystemService.evaluateMetrics((Long) serverId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(serverMetricsRepository, times(1)).findTopByServerIdOrderByCollectedAtDesc(serverId);
        verify(alertRuleService, times(1)).getAlertRulesByServerId(serverId);
        verify(alertEventService, never()).createAlertEvent(any());
        verify(notificationService, never()).sendAlertNotifications(any());
    }

    @Test
    void testEvaluateMetrics_NoEnabledRules() {
        // Given
        Long serverId = 1L;
        // Disable the rule so it won't trigger
        testAlertRule.setEnabled(false);
        List<AlertRule> projectRules = Arrays.asList(testAlertRule);

        when(serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(serverId)).thenReturn(testMetrics);
        when(alertRuleService.getAlertRulesByServerId(serverId)).thenReturn(projectRules);
        // no event expected, do not stub create

        // When
        List<AlertEvent> result = alertSystemService.evaluateMetrics((Long) serverId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(serverMetricsRepository, times(1)).findTopByServerIdOrderByCollectedAtDesc(serverId);
        verify(alertRuleService, times(1)).getAlertRulesByServerId(serverId);
        verify(alertEventService, never()).createAlertEvent(any());
        verify(notificationService, never()).sendAlertNotifications(any());
    }

    @Test
    void testEvaluateMetrics_NoRecentMetrics() {
        // Given
        Long serverId = 1L;
        List<AlertRule> projectRules = Arrays.asList(testAlertRule);

        when(serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(serverId)).thenReturn(null);

        // When
        List<AlertEvent> result = alertSystemService.evaluateMetrics((Long) serverId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(serverMetricsRepository, times(1)).findTopByServerIdOrderByCollectedAtDesc(serverId);
        verify(alertRuleService, never()).getAlertRulesByServerId(any());
        verify(alertEventService, never()).createAlertEvent(any());
        verify(notificationService, never()).sendAlertNotifications(any());
    }

    @Test
    void testEvaluateMetrics_NullServerId() {
        // Given
        when(serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(null)).thenReturn(null);

        // When
        List<AlertEvent> result = alertSystemService.evaluateMetrics((Long) null);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(serverMetricsRepository, times(1)).findTopByServerIdOrderByCollectedAtDesc(null);
        verify(alertRuleService, never()).getAlertRulesByServerId(any());
        verify(alertEventService, never()).createAlertEvent(any());
        verify(notificationService, never()).sendAlertNotifications(any());
    }
}