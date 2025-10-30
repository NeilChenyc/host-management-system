package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.repository.AlertEventRepository;
import com.elec5619.backend.repository.ServerRepository;
import com.elec5619.backend.service.impl.AlertEventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertEventServiceMoreTest {

    @Mock
    private AlertEventRepository alertEventRepository;

    @Mock
    private ServerRepository serverRepository;

    @InjectMocks
    private AlertEventServiceImpl service;

    private AlertEvent existing;
    private AlertEvent update;

    @BeforeEach
    void setup() {
        existing = new AlertEvent();
        existing.setEventId(1L);
        existing.setServerId(10L);
        existing.setStatus("firing");
        existing.setStartedAt(LocalDateTime.now().minusHours(1));
        existing.setSummary("old");

        update = new AlertEvent();
        update.setServerId(11L);
        update.setStatus("active");
        update.setStartedAt(LocalDateTime.now());
        update.setResolvedAt(null);
        update.setTriggeredValue(12.3);
        update.setSummary("new");
    }

    @Test
    void updateAlertEvent_success() {
        when(alertEventRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(alertEventRepository.save(any(AlertEvent.class))).thenAnswer(inv -> inv.getArgument(0));

        AlertEvent saved = service.updateAlertEvent(1L, update);
        assertNotNull(saved);
        assertEquals(11L, saved.getServerId());
        assertEquals("active", saved.getStatus());
        assertEquals("new", saved.getSummary());
        verify(alertEventRepository).save(existing);
    }

    @Test
    void updateAlertEvent_notFound_throws() {
        when(alertEventRepository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.updateAlertEvent(2L, update));
    }

    @Test
    void resolveAlertEvent_success_setsResolved() {
        when(alertEventRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(alertEventRepository.save(any(AlertEvent.class))).thenAnswer(inv -> inv.getArgument(0));
        AlertEvent resolved = service.resolveAlertEvent(1L);
        assertEquals("resolved", resolved.getStatus());
        assertNotNull(resolved.getResolvedAt());
        verify(alertEventRepository).save(existing);
    }

    @Test
    void resolveAlertEvent_notFound_throws() {
        when(alertEventRepository.findById(9L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.resolveAlertEvent(9L));
    }

    @Test
    void getAlertEventsWithFilters_noPaging_delegates() {
        List<AlertEvent> list = List.of(existing);
        when(alertEventRepository.findByFilters(eq(1L), eq(2L), eq("firing"), any(), any())).thenReturn(list);
        List<AlertEvent> result = service.getAlertEventsWithFilters(1L, 2L, "firing", LocalDateTime.now().minusDays(1), LocalDateTime.now());
        assertEquals(1, result.size());
        verify(alertEventRepository).findByFilters(any(), any(), any(), any(), any());
    }

    @Test
    void getAlertEventsWithFilters_withPaging_delegates() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<AlertEvent> page = new PageImpl<>(List.of(existing), pageable, 1);
        when(alertEventRepository.findByFilters(eq(1L), eq(2L), eq("firing"), any(), any(), eq(pageable))).thenReturn(page);
        Page<AlertEvent> result = service.getAlertEventsWithFilters(1L, 2L, "firing", LocalDateTime.now().minusDays(1), LocalDateTime.now(), pageable);
        assertEquals(1, result.getTotalElements());
        verify(alertEventRepository).findByFilters(any(), any(), any(), any(), any(), any());
    }
}


