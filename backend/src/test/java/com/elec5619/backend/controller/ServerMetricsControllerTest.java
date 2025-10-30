package com.elec5619.backend.controller;

import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.service.ServerMetricsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ServerMetricsController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class})
class ServerMetricsControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean ServerMetricsService serverMetricsService;

    @Test
    void getLatestMetrics_found() throws Exception {
        ServerMetrics m = new ServerMetrics(); m.setMetricId(1L); m.setServerId(10L);
        given(serverMetricsService.getLatestMetrics(10L)).willReturn(Optional.of(m));
        mockMvc.perform(get("/api/servers/10/metrics/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.metricId").value(1));
    }

    @Test
    void getServerMetrics_range_ok() throws Exception {
        given(serverMetricsService.getMetricsForServer(5L, 100, 0)).willReturn(List.of());
        mockMvc.perform(get("/api/servers/5/metrics").param("limit", "100").param("offset", "0"))
                .andExpect(status().isOk());
    }

    @Test
    void collectMetrics_missingServerId_badRequest() throws Exception {
        String body = "{\"cpuUsage\":10.0}";
        mockMvc.perform(post("/api/servers/metrics/collect")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest());
    }
}


