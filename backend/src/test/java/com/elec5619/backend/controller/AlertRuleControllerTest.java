package com.elec5619.backend.controller;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.service.AlertRuleService;
import com.elec5619.backend.util.PermissionChecker;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AlertRuleController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class})
class AlertRuleControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean AlertRuleService alertRuleService;
    @MockBean PermissionChecker permissionChecker;

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


