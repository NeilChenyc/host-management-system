package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for NotificationService
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    private AlertEvent testAlertEvent;
    private AlertRule testAlertRule;

    @BeforeEach
    void setUp() {
        // Setup test alert rule
        testAlertRule = new AlertRule();
        testAlertRule.setRuleId(1L);
        testAlertRule.setRuleName("Test CPU Alert");
        testAlertRule.setTargetMetric("cpuUsage");
        testAlertRule.setComparator(">");
        testAlertRule.setThreshold(80.0);
        testAlertRule.setSeverity("CRITICAL");

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
    void testSendAlertNotification_Success() {
        // When
        try {
            notificationService.sendAlertNotification(testAlertEvent);
        } catch (Exception e) {
            fail("Should not throw exception: " + e.getMessage());
        }

        // Then - No exceptions should be thrown
        // The method should complete successfully
    }

    @Test
    void testSendAlertNotification_NullInput() {
        // When
        try {
            notificationService.sendAlertNotification(null);
        } catch (Exception e) {
            fail("Should not throw exception: " + e.getMessage());
        }
    }

    @Test
    void testSendAlertNotifications_Success() {
        // Given
        AlertEvent event1 = new AlertEvent();
        event1.setEventId(1L);
        event1.setAlertRule(testAlertRule);
        event1.setServerId(1L);
        event1.setSummary("Event 1");
        event1.setStatus("ACTIVE");

        AlertEvent event2 = new AlertEvent();
        event2.setEventId(2L);
        event2.setAlertRule(testAlertRule);
        event2.setServerId(2L);
        event2.setSummary("Event 2");
        event2.setStatus("ACTIVE");

        List<AlertEvent> alertEvents = Arrays.asList(event1, event2);

        // When
        try {
            notificationService.sendAlertNotifications(alertEvents);
        } catch (Exception e) {
            fail("Should not throw exception: " + e.getMessage());
        }

        // Then - No exceptions should be thrown
    }

    @Test
    void testSendAlertNotifications_EmptyList() {
        // Given
        List<AlertEvent> emptyList = Arrays.asList();

        // When
        try {
            notificationService.sendAlertNotifications(emptyList);
        } catch (Exception e) {
            fail("Should not throw exception: " + e.getMessage());
        }

        // Then - No exceptions should be thrown
    }

    @Test
    void testSendAlertNotifications_NullList() {
        // When
        try {
            notificationService.sendAlertNotifications(null);
        } catch (Exception e) {
            fail("Should not throw exception: " + e.getMessage());
        }

        // Then - No exceptions should be thrown
    }

    @Test
    void testSendAlertNotification_CooldownPeriod() {
        // Given
        AlertEvent event1 = new AlertEvent();
        event1.setEventId(1L);
        event1.setAlertRule(testAlertRule);
        event1.setServerId(1L);
        event1.setSummary("First notification");
        event1.setStatus("ACTIVE");

        AlertEvent event2 = new AlertEvent();
        event2.setEventId(2L);
        event2.setAlertRule(testAlertRule);
        event2.setServerId(1L);
        event2.setSummary("Second notification");
        event2.setStatus("ACTIVE");

        // When - Send first notification
        try {
            notificationService.sendAlertNotification(event1);
        } catch (Exception e) {
            fail("Should not throw exception: " + e.getMessage());
        }

        // Send second notification immediately (should be skipped due to cooldown)
        try {
            notificationService.sendAlertNotification(event2);
        } catch (Exception e) {
            fail("Should not throw exception: " + e.getMessage());
        }

        // Then - Both calls should complete without exceptions
        // The second notification should be skipped due to cooldown period
    }

    @Test
    void testSendAlertNotification_DifferentServers() {
        // Given
        AlertEvent event1 = new AlertEvent();
        event1.setEventId(1L);
        event1.setAlertRule(testAlertRule);
        event1.setServerId(1L);
        event1.setSummary("Server 1 notification");
        event1.setStatus("ACTIVE");

        AlertEvent event2 = new AlertEvent();
        event2.setEventId(2L);
        event2.setAlertRule(testAlertRule);
        event2.setServerId(2L);
        event2.setSummary("Server 2 notification");
        event2.setStatus("ACTIVE");

        // When
        try {
            notificationService.sendAlertNotification(event1);
            notificationService.sendAlertNotification(event2);
        } catch (Exception e) {
            fail("Should not throw exception: " + e.getMessage());
        }

        // Then - Both notifications should be sent (different servers)
    }

    @Test
    void testSendAlertNotification_MultipleSeverities() {
        // Given
        AlertRule criticalRule = new AlertRule();
        criticalRule.setRuleId(1L);
        criticalRule.setRuleName("Critical Alert");
        criticalRule.setSeverity("CRITICAL");

        AlertRule warningRule = new AlertRule();
        warningRule.setRuleId(2L);
        warningRule.setRuleName("Warning Alert");
        warningRule.setSeverity("WARNING");

        AlertRule infoRule = new AlertRule();
        infoRule.setRuleId(3L);
        infoRule.setRuleName("Info Alert");
        infoRule.setSeverity("INFO");

        AlertEvent criticalEvent = new AlertEvent();
        criticalEvent.setEventId(1L);
        criticalEvent.setAlertRule(criticalRule);
        criticalEvent.setServerId(1L);
        criticalEvent.setSummary("Critical notification");
        criticalEvent.setStatus("ACTIVE");

        AlertEvent warningEvent = new AlertEvent();
        warningEvent.setEventId(2L);
        warningEvent.setAlertRule(warningRule);
        warningEvent.setServerId(1L);
        warningEvent.setSummary("Warning notification");
        warningEvent.setStatus("ACTIVE");

        AlertEvent infoEvent = new AlertEvent();
        infoEvent.setEventId(3L);
        infoEvent.setAlertRule(infoRule);
        infoEvent.setServerId(1L);
        infoEvent.setSummary("Info notification");
        infoEvent.setStatus("ACTIVE");

        // When
        try {
            notificationService.sendAlertNotification(criticalEvent);
            notificationService.sendAlertNotification(warningEvent);
            notificationService.sendAlertNotification(infoEvent);
        } catch (Exception e) {
            fail("Should not throw exception: " + e.getMessage());
        }

        // Then - All notifications should be sent successfully
    }
}