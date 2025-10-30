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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertSystemServiceEdgeTest {

    @Mock private AlertRuleService alertRuleService;
    @Mock private AlertEventService alertEventService;
    @Mock private ServerMetricsRepository serverMetricsRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private AlertSystemServiceImpl service;

    private ServerMetrics metrics;
    private AlertRule rule;

    @BeforeEach
    void setup() {
        metrics = new ServerMetrics();
        metrics.setServerId(1L);
        metrics.setCollectedAt(LocalDateTime.now());
        metrics.setCpuUsage(0.7);

        rule = new AlertRule();
        rule.setRuleId(10L);
        rule.setRuleName("cpu");
        rule.setComparator(">=");
        rule.setThreshold(0.7);
        rule.setDuration(1);
        rule.setSeverity("high");
        rule.setTargetMetric("cpu_usage");
        rule.setEnabled(true);
    }

    @Test
    void evaluateMetrics_byServerId_noMetrics_returnsEmpty() {
        when(serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(1L)).thenReturn(null);
        List<AlertEvent> list = service.evaluateMetrics(1L);
        assertTrue(list.isEmpty());
    }

    @Test
    void evaluateMetrics_byServerId_rulesDisabled_returnsEmpty() {
        when(serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(1L)).thenReturn(metrics);
        AlertRule disabled = new AlertRule();
        disabled.setEnabled(false);
        when(alertRuleService.getAlertRulesByServerId(1L)).thenReturn(List.of(disabled));
        List<AlertEvent> list = service.evaluateMetrics(1L);
        assertTrue(list.isEmpty());
    }

    @Test
    void evaluateMetrics_byServerId_thresholdEdge_triggersOnce_noDuplicate() {
        when(serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(1L)).thenReturn(metrics);
        when(alertRuleService.getAlertRulesByServerId(1L)).thenReturn(List.of(rule));
        when(alertEventService.getAlertEventsWithFilters(eq(10L), eq(1L), eq("firing"), any(), any()))
                .thenReturn(List.of()); // first time: no duplicates
        when(alertEventService.createAlertEvent(any(AlertEvent.class))).thenAnswer(inv -> inv.getArgument(0));

        List<AlertEvent> first = service.evaluateMetrics(1L);
        assertEquals(1, first.size());

        // Second call within window should skip as duplicate
        when(alertEventService.getAlertEventsWithFilters(eq(10L), eq(1L), eq("firing"), any(), any()))
                .thenReturn(List.of(new AlertEvent()));
        List<AlertEvent> second = service.evaluateMetrics(1L);
        assertTrue(second.isEmpty());
    }

    @Test
    void evaluateMetrics_withProvidedMetrics_handlesException_andReturnsEmpty() {
        when(alertRuleService.getAlertRulesByEnabled(true)).thenThrow(new RuntimeException("x"));
        List<AlertEvent> list = service.evaluateMetrics(metrics);
        assertTrue(list.isEmpty());
    }

    @Test
    void validateAlertRule_happy_and_badInputs() {
        assertTrue(service.validateAlertRule(rule));
        AlertRule bad = new AlertRule();
        bad.setRuleName("r");
        bad.setTargetMetric("cpuUsage");
        bad.setComparator("?");
        bad.setThreshold(0.5);
        bad.setDuration(0);
        bad.setSeverity("LOW");
        assertFalse(service.validateAlertRule(bad));
    }
}


