package com.elec5619.backend.controller;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.dto.AlertEventResponseDto;
import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.service.AlertEventService;
import com.elec5619.backend.service.AlertRuleService;
import com.elec5619.backend.service.AlertSystemService;
import com.elec5619.backend.util.JwtUtil;
import com.elec5619.backend.util.PermissionChecker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AlertEventControllerTest {
    private MockMvc mockMvc;
    @Mock AlertEventService alertEventService;
    @Mock AlertSystemService alertSystemService;
    @Mock AlertRuleService alertRuleService;
    @Mock PermissionChecker permissionChecker;
    @Mock JwtUtil jwtUtil;

    @BeforeEach
    void setup() {
        AlertEventController controller = new AlertEventController(alertEventService, alertSystemService, alertRuleService);
        ReflectionTestUtils.setField(controller, "permissionChecker", permissionChecker);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

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


