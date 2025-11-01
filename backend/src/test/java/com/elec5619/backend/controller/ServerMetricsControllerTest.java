package com.elec5619.backend.controller;

import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.config.WebConfig;
import com.elec5619.backend.interceptor.JwtInterceptor;
import com.elec5619.backend.util.JwtUtil;
import com.elec5619.backend.service.ServerMetricsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ServerMetricsController.class)
@AutoConfigureMockMvc(addFilters = false)
class ServerMetricsControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private ServerMetricsService serverMetricsService;
    @MockitoBean private WebConfig webConfig;
    @MockitoBean private JwtInterceptor jwtInterceptor;
    @MockitoBean private JwtUtil jwtUtil;

    private ServerMetrics metrics;

    @BeforeEach
    void setup() {
        metrics = new ServerMetrics();
        metrics.setMetricId(1L);
        metrics.setServerId(10L);
        metrics.setCollectedAt(LocalDateTime.now());
        metrics.setCpuUsage(0.5);
        // Bypass interceptor
        try {
            org.mockito.Mockito.when(jwtInterceptor.preHandle(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void latest_ok_or_notFound() throws Exception {
        when(serverMetricsService.getLatestMetrics(10L)).thenReturn(Optional.of(metrics));
        mockMvc.perform(get("/api/servers/10/metrics/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.metricId").value(1L));

        when(serverMetricsService.getLatestMetrics(11L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/servers/11/metrics/latest"))
                .andExpect(status().isNotFound());
    }

    @Test
    void list_with_limit_offset_ok() throws Exception {
        when(serverMetricsService.getMetricsForServer(eq(10L), anyInt(), anyInt())).thenReturn(List.of(metrics));
        mockMvc.perform(get("/api/servers/10/metrics?limit=50&offset=0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].metricId").value(1L));
    }

    @Test
    void range_for_server_ok() throws Exception {
        when(serverMetricsService.getMetricsForServer(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(metrics));
        mockMvc.perform(get("/api/servers/10/metrics/range?startTime=2025-01-01T00:00:00&endTime=2025-01-01T01:00:00"))
                .andExpect(status().isOk());
    }

    @Test
    void range_for_all_ok() throws Exception {
        when(serverMetricsService.getAllMetrics(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(metrics));
        mockMvc.perform(get("/api/servers/metrics/range?startTime=2025-01-01T00:00:00&endTime=2025-01-01T01:00:00"))
                .andExpect(status().isOk());
    }

    @Test
    void recent_ok() throws Exception {
        when(serverMetricsService.getAllMetrics(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(metrics));
        mockMvc.perform(get("/api/servers/metrics/recent"))
                .andExpect(status().isOk());
    }

    @Test
    void collect_validate_and_ok() throws Exception {
        when(serverMetricsService.saveMetrics(any(ServerMetrics.class))).thenReturn(metrics);

        // Bad request - missing serverId
        ServerMetrics invalid = new ServerMetrics();
        invalid.setCpuUsage(0.7);
        mockMvc.perform(post("/api/servers/metrics/collect")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());

        // Ok when provided
        ServerMetrics valid = new ServerMetrics();
        valid.setServerId(10L);
        mockMvc.perform(post("/api/servers/metrics/collect")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(valid)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Metrics received successfully"));
    }

    @Test
    void generate_ok() throws Exception {
        mockMvc.perform(post("/api/servers/metrics/generate"))
                .andExpect(status().isOk());
    }

    @Test
    void summary_ok_or_notFound() throws Exception {
        when(serverMetricsService.getMetricsForServer(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(metrics));
        mockMvc.perform(get("/api/servers/10/metrics/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dataPoints").exists());

        when(serverMetricsService.getMetricsForServer(anyLong(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
        mockMvc.perform(get("/api/servers/11/metrics/summary"))
                .andExpect(status().isNotFound());
    }
}


