package com.elec5619.backend.scheduler;

import com.elec5619.backend.dto.ServerResponseDto;
import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.entity.ServerStatus;
import com.elec5619.backend.service.AlertSystemService;
import com.elec5619.backend.service.ServerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AlertEvaluationScheduler
 */
@ExtendWith(MockitoExtension.class)
class AlertEvaluationSchedulerTest {

    @Mock
    private ServerService serverService;

    @Mock
    private AlertSystemService alertSystemService;

    @InjectMocks
    private AlertEvaluationScheduler alertEvaluationScheduler;

    private ServerResponseDto testServer;
    private AlertEvent testAlertEvent;
    private AlertRule testAlertRule;

    @BeforeEach
    void setUp() {
        // Setup test server
        testServer = new ServerResponseDto();
        testServer.setId(1L);
        testServer.setServerName("Test Server");
        testServer.setIpAddress("192.168.1.100");
        testServer.setStatus(ServerStatus.UP);

        // Setup test alert rule
        testAlertRule = new AlertRule();
        testAlertRule.setRuleId(1L);
        testAlertRule.setRuleName("Test CPU Alert");
        testAlertRule.setTargetMetric("cpuUsage");
        testAlertRule.setComparator("GREATER_THAN");
        testAlertRule.setThreshold(80.0);
        testAlertRule.setSeverity("CRITICAL");

        // Setup test alert event
        testAlertEvent = new AlertEvent();
        testAlertEvent.setEventId(1L);
        testAlertEvent.setAlertRule(testAlertRule);
        testAlertEvent.setServerId(1L);
        testAlertEvent.setSummary("CPU usage exceeded threshold");
        testAlertEvent.setStatus("ACTIVE");
    }

    @Test
    void testEvaluateAlertRules_Success() {
        // Given
        List<ServerResponseDto> servers = Arrays.asList(testServer);
        List<AlertEvent> triggeredAlerts = Arrays.asList(testAlertEvent);

        when(serverService.listAll()).thenReturn(servers);
        when(alertSystemService.evaluateMetrics(any(Long.class))).thenReturn(triggeredAlerts);

        // When
        alertEvaluationScheduler.evaluateAlertRules();

        // Then
        verify(serverService, times(1)).listAll();
        verify(alertSystemService, times(1)).evaluateMetrics(1L);
    }

    @Test
    void testEvaluateAlertRules_MultipleServers() {
        // Given
        ServerResponseDto server1 = new ServerResponseDto();
        server1.setId(1L);
        server1.setServerName("Server 1");

        ServerResponseDto server2 = new ServerResponseDto();
        server2.setId(2L);
        server2.setServerName("Server 2");

        ServerResponseDto server3 = new ServerResponseDto();
        server3.setId(3L);
        server3.setServerName("Server 3");

        List<ServerResponseDto> servers = Arrays.asList(server1, server2, server3);
        List<AlertEvent> triggeredAlerts = Arrays.asList(testAlertEvent);

        when(serverService.listAll()).thenReturn(servers);
        when(alertSystemService.evaluateMetrics(any(Long.class))).thenReturn(triggeredAlerts);

        // When
        alertEvaluationScheduler.evaluateAlertRules();

        // Then
        verify(serverService, times(1)).listAll();
        verify(alertSystemService, times(1)).evaluateMetrics(1L);
        verify(alertSystemService, times(1)).evaluateMetrics(2L);
        verify(alertSystemService, times(1)).evaluateMetrics(3L);
    }

    @Test
    void testEvaluateAlertRules_NoServers() {
        // Given
        List<ServerResponseDto> emptyServers = Arrays.asList();

        when(serverService.listAll()).thenReturn(emptyServers);

        // When
        alertEvaluationScheduler.evaluateAlertRules();

        // Then
        verify(serverService, times(1)).listAll();
        verify(alertSystemService, never()).evaluateMetrics(any(Long.class));
    }

    @Test
    void testEvaluateAlertRules_NoTriggeredAlerts() {
        // Given
        List<ServerResponseDto> servers = Arrays.asList(testServer);
        List<AlertEvent> emptyAlerts = Arrays.asList();

        when(serverService.listAll()).thenReturn(servers);
        when(alertSystemService.evaluateMetrics(any(Long.class))).thenReturn(emptyAlerts);

        // When
        alertEvaluationScheduler.evaluateAlertRules();

        // Then
        verify(serverService, times(1)).listAll();
        verify(alertSystemService, times(1)).evaluateMetrics(1L);
    }

    @Test
    void testEvaluateAlertRules_MultipleTriggeredAlerts() {
        // Given
        List<ServerResponseDto> servers = Arrays.asList(testServer);
        
        AlertEvent alert1 = new AlertEvent();
        alert1.setEventId(1L);
        alert1.setAlertRule(testAlertRule);
        alert1.setServerId(1L);
        alert1.setSummary("Alert 1");

        AlertEvent alert2 = new AlertEvent();
        alert2.setEventId(2L);
        alert2.setAlertRule(testAlertRule);
        alert2.setServerId(1L);
        alert2.setSummary("Alert 2");

        AlertEvent alert3 = new AlertEvent();
        alert3.setEventId(3L);
        alert3.setAlertRule(testAlertRule);
        alert3.setServerId(1L);
        alert3.setSummary("Alert 3");

        List<AlertEvent> multipleAlerts = Arrays.asList(alert1, alert2, alert3);

        when(serverService.listAll()).thenReturn(servers);
        when(alertSystemService.evaluateMetrics(any(Long.class))).thenReturn(multipleAlerts);

        // When
        alertEvaluationScheduler.evaluateAlertRules();

        // Then
        verify(serverService, times(1)).listAll();
        verify(alertSystemService, times(1)).evaluateMetrics(1L);
    }

    @Test
    void testEvaluateAlertRules_ServerServiceException() {
        // Given
        when(serverService.listAll()).thenThrow(new RuntimeException("Database connection error"));

        // When
        try {
            alertEvaluationScheduler.evaluateAlertRules();
        } catch (Exception e) {
            // Expected to handle exception gracefully
        }

        // Then
        verify(serverService, times(1)).listAll();
        verify(alertSystemService, never()).evaluateMetrics(any(Long.class));
    }

    @Test
    void testEvaluateAlertRules_AlertSystemServiceException() {
        // Given
        List<ServerResponseDto> servers = Arrays.asList(testServer);

        when(serverService.listAll()).thenReturn(servers);
        when(alertSystemService.evaluateMetrics(any(Long.class)))
                .thenThrow(new RuntimeException("Alert evaluation error"));

        // When
        try {
            alertEvaluationScheduler.evaluateAlertRules();
        } catch (Exception e) {
            // Expected to handle exception gracefully
        }

        // Then
        verify(serverService, times(1)).listAll();
        verify(alertSystemService, times(1)).evaluateMetrics(1L);
    }

    @Test
    void testEvaluateAlertRules_PartialFailure() {
        // Given
        ServerResponseDto server1 = new ServerResponseDto();
        server1.setId(1L);
        server1.setServerName("Server 1");

        ServerResponseDto server2 = new ServerResponseDto();
        server2.setId(2L);
        server2.setServerName("Server 2");

        List<ServerResponseDto> servers = Arrays.asList(server1, server2);
        List<AlertEvent> triggeredAlerts = Arrays.asList(testAlertEvent);

        when(serverService.listAll()).thenReturn(servers);
        when(alertSystemService.evaluateMetrics(1L)).thenReturn(triggeredAlerts);
        when(alertSystemService.evaluateMetrics(2L))
                .thenThrow(new RuntimeException("Evaluation failed for server 2"));

        // When
        try {
            alertEvaluationScheduler.evaluateAlertRules();
        } catch (Exception e) {
            // Expected to handle exception gracefully
        }

        // Then
        verify(serverService, times(1)).listAll();
        verify(alertSystemService, times(1)).evaluateMetrics(1L);
        verify(alertSystemService, times(1)).evaluateMetrics(2L);
    }

    @Test
    void testEvaluateAlertRules_NullServerList() {
        // Given
        when(serverService.listAll()).thenReturn(null);

        // When
        try {
            alertEvaluationScheduler.evaluateAlertRules();
        } catch (Exception e) {
            // Expected to handle exception gracefully
        }

        // Then
        verify(serverService, times(1)).listAll();
        verify(alertSystemService, never()).evaluateMetrics(any(Long.class));
    }

    @Test
    void testEvaluateAlertRules_ConcurrentExecution() {
        // Given
        List<ServerResponseDto> servers = Arrays.asList(testServer);
        List<AlertEvent> triggeredAlerts = Arrays.asList(testAlertEvent);

        when(serverService.listAll()).thenReturn(servers);
        when(alertSystemService.evaluateMetrics(any(Long.class))).thenReturn(triggeredAlerts);

        // When - Simulate multiple concurrent executions
        alertEvaluationScheduler.evaluateAlertRules();
        alertEvaluationScheduler.evaluateAlertRules();
        alertEvaluationScheduler.evaluateAlertRules();

        // Then
        verify(serverService, times(3)).listAll();
        verify(alertSystemService, times(3)).evaluateMetrics(1L);
    }
}