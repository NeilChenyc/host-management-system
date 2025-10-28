package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.repository.AlertEventRepository;
import com.elec5619.backend.service.impl.AlertEventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AlertEventService
 */
@ExtendWith(MockitoExtension.class)
class AlertEventServiceTest {

    @Mock
    private AlertEventRepository alertEventRepository;

    @InjectMocks
    private AlertEventServiceImpl alertEventService;

    private AlertEvent testAlertEvent;
    private AlertRule testAlertRule;

    @BeforeEach
    void setUp() {
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
        testAlertEvent.setStartedAt(LocalDateTime.now());
    }

    @Test
    void testCreateAlertEvent_Success() {
        // Given
        when(alertEventRepository.save(any(AlertEvent.class))).thenReturn(testAlertEvent);

        // When
        AlertEvent result = alertEventService.createAlertEvent(testAlertEvent);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getEventId());
        assertEquals(1L, result.getServerId());
        assertEquals("CPU usage exceeded threshold", result.getSummary());
        assertEquals("ACTIVE", result.getStatus());
        assertNotNull(result.getAlertRule());
        assertEquals("Test CPU Alert", result.getAlertRule().getRuleName());

        verify(alertEventRepository, times(1)).save(testAlertEvent);
    }

    @Test
    void testCreateAlertEvent_NullInput() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            alertEventService.createAlertEvent(null);
        });

        verify(alertEventRepository, never()).save(any());
    }

    @Test
    void testGetAllAlertEvents_Success() {
        // Given
        AlertEvent event1 = new AlertEvent();
        event1.setEventId(1L);
        event1.setSummary("Event 1");

        AlertEvent event2 = new AlertEvent();
        event2.setEventId(2L);
        event2.setSummary("Event 2");

        List<AlertEvent> mockEvents = Arrays.asList(event1, event2);
        when(alertEventRepository.findAll()).thenReturn(mockEvents);

        // When
        List<AlertEvent> result = alertEventService.getAllAlertEvents();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Event 1", result.get(0).getSummary());
        assertEquals("Event 2", result.get(1).getSummary());

        verify(alertEventRepository, times(1)).findAll();
    }

    @Test
    void testGetAlertEventById_Success() {
        // Given
        Long eventId = 1L;
        when(alertEventRepository.findById(eventId)).thenReturn(Optional.of(testAlertEvent));

        // When
        Optional<AlertEvent> result = alertEventService.getAlertEventById(eventId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(eventId, result.get().getEventId());
        assertEquals("CPU usage exceeded threshold", result.get().getSummary());

        verify(alertEventRepository, times(1)).findById(eventId);
    }

    @Test
    void testGetAlertEventById_NotFound() {
        // Given
        Long eventId = 999L;
        when(alertEventRepository.findById(eventId)).thenReturn(Optional.empty());

        // When
        Optional<AlertEvent> result = alertEventService.getAlertEventById(eventId);

        // Then
        assertFalse(result.isPresent());

        verify(alertEventRepository, times(1)).findById(eventId);
    }

    @Test
    void testGetAlertEventsByServerId_Success() {
        // Given
        Long serverId = 1L;
        AlertEvent event1 = new AlertEvent();
        event1.setEventId(1L);
        event1.setServerId(serverId);

        AlertEvent event2 = new AlertEvent();
        event2.setEventId(2L);
        event2.setServerId(serverId);

        List<AlertEvent> serverEvents = Arrays.asList(event1, event2);
        when(alertEventRepository.findByServerId(serverId)).thenReturn(serverEvents);

        // When
        List<AlertEvent> result = alertEventService.getAlertEventsByServerId(serverId);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(event -> serverId.equals(event.getServerId())));

        verify(alertEventRepository, times(1)).findByServerId(serverId);
    }

    @Test
    void testDeleteAlertEvent_Success() {
        // Given
        Long eventId = 1L;
        when(alertEventRepository.existsById(eventId)).thenReturn(true);

        // When
        alertEventService.deleteAlertEvent(eventId);

        // Then
        verify(alertEventRepository, times(1)).existsById(eventId);
        verify(alertEventRepository, times(1)).deleteById(eventId);
    }

    @Test
    void testDeleteAlertEvent_NotFound() {
        // Given
        Long eventId = 999L;
        when(alertEventRepository.existsById(eventId)).thenReturn(false);

        // When
        alertEventService.deleteAlertEvent(eventId);

        // Then
        verify(alertEventRepository, times(1)).existsById(eventId);
        verify(alertEventRepository, never()).deleteById(any());
    }
}