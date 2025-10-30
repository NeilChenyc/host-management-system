package com.elec5619.backend.controller;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.service.AlertRuleService;
import com.elec5619.backend.util.JwtUtil;
import com.elec5619.backend.util.PermissionChecker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.List;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AlertRuleControllerTest {
    private MockMvc mockMvc;
    @Mock AlertRuleService alertRuleService;
    @Mock PermissionChecker permissionChecker;
    @Mock JwtUtil jwtUtil;

    @BeforeEach
    void setup() {
        AlertRuleController controller = new AlertRuleController(alertRuleService);
        ReflectionTestUtils.setField(controller, "permissionChecker", permissionChecker);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void createRule_checksPermission_andCreated() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(1L), eq(PermissionConstants.ALERT_MANAGE_ALL));
        AlertRule rule = new AlertRule(); rule.setRuleName("cpu");
        given(alertRuleService.createAlertRule(any(AlertRule.class))).willReturn(rule);
        String body = "{\"ruleName\":\"cpu\",\"targetMetric\":\"cpu_usage\",\"comparator\":\">\",\"threshold\":80,\"duration\":1,\"severity\":\"HIGH\",\"enabled\":true,\"serverId\":1}";
        mockMvc.perform(post("/api/alert-rules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
                .requestAttr("userId", 1L))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ruleName").value("cpu"));
    }

    @Test
    void getAll_rules_requiresReadPermission_andOk() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(2L), eq(PermissionConstants.ALERT_READ_ALL));
        given(alertRuleService.getAllAlertRules()).willReturn(List.of());
        mockMvc.perform(get("/api/alert-rules").requestAttr("userId", 2L))
                .andExpect(status().isOk());
    }

    @Test
    void getById_found() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(3L), eq(PermissionConstants.ALERT_READ_ALL));
        AlertRule rule = new AlertRule(); rule.setRuleId(5L); rule.setRuleName("disk");
        given(alertRuleService.getAlertRuleById(5L)).willReturn(Optional.of(rule));
        mockMvc.perform(get("/api/alert-rules/5").requestAttr("userId", 3L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ruleName").value("disk"));
    }
}


