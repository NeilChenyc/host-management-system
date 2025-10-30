package com.elec5619.backend.controller;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.dto.AlertEventResponseDto;
import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.service.AlertEventService;
import com.elec5619.backend.service.AlertRuleService;
import com.elec5619.backend.service.AlertSystemService;
import com.elec5619.backend.util.PermissionChecker;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AlertEventController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class})
class AlertEventControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean AlertEventService alertEventService;
    @MockBean AlertSystemService alertSystemService;
    @MockBean AlertRuleService alertRuleService;
    @MockBean PermissionChecker permissionChecker;

    @Test
    void getAll_requiresReadPermission_andOk() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(1L), eq(PermissionConstants.ALERT_READ_ALL));
        given(alertEventService.getAllAlertEventsWithNames()).willReturn(List.of(new AlertEventResponseDto()));
        mockMvc.perform(get("/api/alert-events").requestAttr("userId", 1L))
                .andExpect(status().isOk());
    }

    @Test
    void getById_found() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(2L), eq(PermissionConstants.ALERT_READ_ALL));
        AlertEvent e = new AlertEvent(); e.setEventId(9L); e.setSummary("x"); e.setStartedAt(LocalDateTime.now());
        given(alertEventService.getAlertEventById(9L)).willReturn(Optional.of(e));
        mockMvc.perform(get("/api/alert-events/9").requestAttr("userId", 2L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventId").value(9));
    }

    @Test
    void delete_requiresManagePermission_andNoContent() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(3L), eq(PermissionConstants.ALERT_MANAGE_ALL));
        Mockito.doNothing().when(alertEventService).deleteAlertEvent(5L);
        mockMvc.perform(delete("/api/alert-events/5").requestAttr("userId", 3L))
                .andExpect(status().isNoContent());
    }
}


