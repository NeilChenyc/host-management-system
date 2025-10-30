package com.elec5619.backend.controller;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.dto.ServerCreateDto;
import com.elec5619.backend.dto.ServerResponseDto;
import com.elec5619.backend.entity.ServerStatus;
import com.elec5619.backend.service.ServerService;
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

@WebMvcTest(controllers = ServerController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class})
class ServerControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean ServerService serverService;
    @MockBean PermissionChecker permissionChecker;

    @Test
    void create_checksPermission_andOk() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(2L), eq(PermissionConstants.SERVER_MANAGE_ALL));
        ServerResponseDto dto = new ServerResponseDto(); dto.setServerName("s1");
        given(serverService.create(any(ServerCreateDto.class))).willReturn(dto);
        String body = "{\"serverName\":\"s1\",\"ipAddress\":\"1.1.1.1\"}";
        mockMvc.perform(post("/api/servers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
                .requestAttr("userId", 2L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serverName").value("s1"));
    }

    @Test
    void listAll_checksPermission_andOk() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(3L), eq(PermissionConstants.SERVER_READ_ALL));
        given(serverService.listAll()).willReturn(List.of());
        mockMvc.perform(get("/api/servers").requestAttr("userId", 3L))
                .andExpect(status().isOk());
    }

    @Test
    void getById_found() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(1L), eq(PermissionConstants.SERVER_READ_ALL));
        ServerResponseDto dto = new ServerResponseDto(); dto.setId(10L); dto.setServerName("host");
        given(serverService.getById(10L)).willReturn(Optional.of(dto));
        mockMvc.perform(get("/api/servers/10").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10));
    }

    @Test
    void updateStatus_checksPermission_andOk() throws Exception {
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(5L), eq(PermissionConstants.SERVER_MANAGE_ALL));
        ServerResponseDto dto = new ServerResponseDto(); dto.setId(7L); dto.setStatus(ServerStatus.online);
        given(serverService.updateStatus(7L, ServerStatus.online)).willReturn(Optional.of(dto));
        mockMvc.perform(put("/api/servers/7/status/online").requestAttr("userId", 5L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.status").value("online"));
    }
}


