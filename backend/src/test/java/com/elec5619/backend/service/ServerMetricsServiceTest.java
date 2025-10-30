package com.elec5619.backend.service;

import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.repository.ServerMetricsRepository;
import com.elec5619.backend.repository.ServerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ServerMetricsServiceTest {
    @Mock ServerMetricsRepository serverMetricsRepository;
    @Mock ServerRepository serverRepository;
    @InjectMocks ServerMetricsService service;

    @BeforeEach void setUp() { MockitoAnnotations.openMocks(this); }

    @Test void saveMetrics_normal_success() {
        ServerMetrics metrics = new ServerMetrics();
        when(serverMetricsRepository.save(metrics)).thenReturn(metrics);
        assertSame(metrics, service.saveMetrics(metrics));
    }

    @Test void getLatestMetrics_found() {
        ServerMetrics metrics = new ServerMetrics();
        when(serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(1L)).thenReturn(metrics);
        Optional<ServerMetrics> result = service.getLatestMetrics(1L);
        assertTrue(result.isPresent());
        assertSame(metrics, result.get());
    }

    @Test void getLatestMetrics_notFound() {
        when(serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(2L)).thenReturn(null);
        assertTrue(service.getLatestMetrics(2L).isEmpty());
    }

    @Test void getMetricsForServer_withPagination() {
        List<ServerMetrics> list = Collections.singletonList(new ServerMetrics());
        when(serverMetricsRepository.findMetricsByServerIdWithPagination(3L, 10, 0)).thenReturn(list);
        List<ServerMetrics> result = service.getMetricsForServer(3L, 10, 0);
        assertEquals(1, result.size());
    }

    @Test void getAllMetrics_inTimeRange() {
        List<ServerMetrics> list = List.of(new ServerMetrics());
        LocalDateTime now = LocalDateTime.now();
        when(serverMetricsRepository.findByCollectedAtBetweenOrderByCollectedAtDesc(now.minusDays(1), now)).thenReturn(list);
        List<ServerMetrics> result = service.getAllMetrics(now.minusDays(1), now);
        assertEquals(1, result.size());
    }

    @Test void cleanupOldMetrics_invokesRepoDelete() {
        doNothing().when(serverMetricsRepository).deleteByCollectedAtBefore(any());
        service.cleanupOldMetrics(30);
        verify(serverMetricsRepository).deleteByCollectedAtBefore(any());
    }
    // TODO: Add tests for generateFakeMetrics, generateFakeMetricsForAllServers, and all private helpers if needed.
}
