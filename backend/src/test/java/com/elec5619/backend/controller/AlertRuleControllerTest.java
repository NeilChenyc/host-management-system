package com.elec5619.backend.controller;

import com.elec5619.backend.config.WebConfig;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.interceptor.JwtInterceptor;
import com.elec5619.backend.service.AlertRuleService;
import com.elec5619.backend.util.JwtUtil;
import com.elec5619.backend.util.PermissionChecker;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
 

@WebMvcTest(controllers = AlertRuleController.class)
@AutoConfigureMockMvc(addFilters = false)
class AlertRuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WebConfig webConfig;

    @MockBean
    private JwtInterceptor jwtInterceptor;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private PermissionChecker permissionChecker;

    @MockBean
    private AlertRuleService alertRuleService;

    private AlertRule sample;

    @BeforeEach
    void setup() {
        sample = new AlertRule();
        sample.setRuleId(1L);
        sample.setRuleName("cpu_high");
        sample.setEnabled(true);
        // Allow interceptor and permissions to pass
        try {
            when(jwtInterceptor.preHandle(any(), any(), any())).thenReturn(true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
    }

    @Test
    void createAlertRule_created() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertRuleService.createAlertRule(any(AlertRule.class))).thenAnswer(inv -> {
            AlertRule r = inv.getArgument(0);
            r.setRuleId(1L);
            return r;
        });

        sample.setSeverity("high");
        sample.setComparator(">=");
        sample.setTargetMetric("cpu_usage");
        sample.setThreshold(0.8);
        sample.setDuration(1);
        sample.setServerId(1L);
        String body = objectMapper.writeValueAsString(sample);
        mockMvc.perform(post("/api/alert-rules").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ruleId").value(1L))
                .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    void getAll_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertRuleService.getAllAlertRules()).thenReturn(List.of(sample));

        mockMvc.perform(get("/api/alert-rules").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ruleId").value(1L));
    }

    @Test
    void getById_notFound() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertRuleService.getAlertRuleById(100L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/alert-rules/100").requestAttr("userId", 1L))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertRuleService.updateAlertRule(eq(1L), any(AlertRule.class))).thenReturn(sample);

        sample.setSeverity("high");
        sample.setComparator(">=");
        sample.setTargetMetric("cpu_usage");
        sample.setThreshold(0.8);
        sample.setDuration(1);
        sample.setServerId(1L);
        String body = objectMapper.writeValueAsString(sample);
        mockMvc.perform(put("/api/alert-rules/1").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ruleId").value(1L));
    }

    @Test
    void delete_noContent() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        Mockito.doNothing().when(alertRuleService).deleteAlertRule(1L);

        mockMvc.perform(delete("/api/alert-rules/1").requestAttr("userId", 1L))
                .andExpect(status().isNoContent());
    }

    @Test
    void getByEnabled_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertRuleService.getAlertRulesByEnabled(true)).thenReturn(List.of(sample));

        mockMvc.perform(get("/api/alert-rules/enabled/true").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].enabled").value(true));
    }

    @Test
    void getBySeverity_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertRuleService.getAlertRulesBySeverity("high")).thenReturn(List.of(sample));
        mockMvc.perform(get("/api/alert-rules/severity/high").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ruleId").value(1L));
    }

    @Test
    void toggleStatus_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        sample.setEnabled(false);
        when(alertRuleService.toggleAlertRuleStatus(1L, false)).thenReturn(sample);

        mockMvc.perform(patch("/api/alert-rules/1/status?enabled=false").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));
    }

    @Test
    void getByServer_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(alertRuleService.getAlertRulesByServerId(9L)).thenReturn(List.of(sample));

        mockMvc.perform(get("/api/alert-rules/server/9").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ruleId").value(1L));
    }
}


