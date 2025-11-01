package com.elec5619.backend.controller;

import com.elec5619.backend.config.WebConfig;
import com.elec5619.backend.dto.AlertEventCreateDto;
import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.interceptor.JwtInterceptor;
import com.elec5619.backend.service.AlertEventService;
import com.elec5619.backend.service.AlertRuleService;
import com.elec5619.backend.service.AlertSystemService;
import com.elec5619.backend.util.JwtUtil;
import com.elec5619.backend.util.PermissionChecker;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
 

@WebMvcTest(controllers = AlertEventController.class)
@AutoConfigureMockMvc(addFilters = false)
class AlertEventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean private WebConfig webConfig;
    @MockitoBean private JwtInterceptor jwtInterceptor;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private PermissionChecker permissionChecker;
    @MockitoBean private AlertEventService alertEventService;
    @MockitoBean private AlertSystemService alertSystemService;
    @MockitoBean private AlertRuleService alertRuleService;

    private AlertRule rule;
    private AlertEvent event;

    @BeforeEach
    void setup() {
        rule = new AlertRule();
        rule.setRuleId(5L);
        rule.setRuleName("cpu");

        event = new AlertEvent();
        event.setEventId(1L);
        event.setServerId(10L);
        event.setStatus("firing");
        event.setStartedAt(LocalDateTime.now());
        event.setSummary("hi");

        // Allow interceptor and permissions to pass
        try {
            when(jwtInterceptor.preHandle(any(), any(), any())).thenReturn(true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
    }

    @Test
    void create_created() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertRuleService.getAlertRuleById(5L)).thenReturn(Optional.of(rule));
        when(alertEventService.createAlertEvent(any(AlertEvent.class))).thenAnswer(inv -> {
            AlertEvent e = inv.getArgument(0);
            e.setEventId(1L);
            return e;
        });

        AlertEventCreateDto dto = new AlertEventCreateDto();
        dto.setRuleId(5L);
        dto.setServerId(10L);
        dto.setStatus("firing");
        dto.setStartedAt(LocalDateTime.now());
        dto.setSummary("hi");

        mockMvc.perform(post("/api/alert-events").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eventId").value(1L));
    }

    @Test
    void getAll_ok_and_error() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertEventService.getAllAlertEventsWithNames()).thenReturn(List.of());
        mockMvc.perform(get("/api/alert-events").requestAttr("userId", 1L))
                .andExpect(status().isOk());

        when(alertEventService.getAllAlertEventsWithNames()).thenThrow(new RuntimeException("boom"));
        mockMvc.perform(get("/api/alert-events").requestAttr("userId", 1L))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getById_notFound() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertEventService.getAlertEventById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/alert-events/999").requestAttr("userId", 1L))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_notFound() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertEventService.updateAlertEvent(eq(1L), any(AlertEvent.class)))
                .thenThrow(new IllegalArgumentException("not found"));

        AlertRule r = new AlertRule(); r.setRuleId(5L);
        event.setAlertRule(r);
        mockMvc.perform(put("/api/alert-events/1").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(event)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void delete_noContent() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        doNothing().when(alertEventService).deleteAlertEvent(1L);
        mockMvc.perform(delete("/api/alert-events/1").requestAttr("userId", 1L))
                .andExpect(status().isNoContent());
    }

    @Test
    void resolve_notFound() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertEventService.resolveAlertEvent(1L)).thenThrow(new IllegalArgumentException("not found"));
        mockMvc.perform(patch("/api/alert-events/1/resolve").requestAttr("userId", 1L))
                .andExpect(status().isNotFound());
    }

    @Test
    void evaluate_badRequest_invalidServerId() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        mockMvc.perform(post("/api/alert-events/evaluate?serverId=0").requestAttr("userId", 1L))
                .andExpect(status().isBadRequest());
    }

    @Test
    void evaluate_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertSystemService.evaluateMetrics(7L)).thenReturn(List.of());
        mockMvc.perform(post("/api/alert-events/evaluate?serverId=7").requestAttr("userId", 1L))
                .andExpect(status().isOk());
    }

    @Test
    void filtered_and_paged_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertEventService.getAlertEventsWithFilters(any(), any(), any(), any(), any()))
                .thenReturn(List.of(event));
        mockMvc.perform(get("/api/alert-events/filtered").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventId").value(1L));

        Page<AlertEvent> page = new PageImpl<>(List.of(event), PageRequest.of(0, 10), 1);
        when(alertEventService.getAlertEventsWithFilters(any(), any(), any(), any(), any(), any()))
                .thenReturn(page);
        mockMvc.perform(get("/api/alert-events/filtered-page").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}


