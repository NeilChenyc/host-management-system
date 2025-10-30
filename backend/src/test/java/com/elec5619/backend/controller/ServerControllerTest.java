package com.elec5619.backend.controller;

import com.elec5619.backend.config.WebConfig;
import com.elec5619.backend.dto.ServerCreateDto;
import com.elec5619.backend.dto.ServerOverviewDto;
import com.elec5619.backend.dto.ServerResponseDto;
import com.elec5619.backend.dto.ServerUpdateDto;
import com.elec5619.backend.entity.ServerStatus;
import com.elec5619.backend.interceptor.JwtInterceptor;
import com.elec5619.backend.service.ServerService;
import com.elec5619.backend.util.JwtUtil;
import com.elec5619.backend.util.PermissionChecker;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
 

@WebMvcTest(controllers = ServerController.class)
@AutoConfigureMockMvc(addFilters = false)
class ServerControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private WebConfig webConfig;
    @MockBean private JwtInterceptor jwtInterceptor;
    @MockBean private JwtUtil jwtUtil;
    @MockBean private PermissionChecker permissionChecker;
    @MockBean private ServerService serverService;

    private ServerResponseDto server;

    @BeforeEach
    void setup() {
        server = new ServerResponseDto();
        server.setId(1L);
        server.setServerName("srv");
        server.setStatus(ServerStatus.online);
        // Allow interceptor and permissions to pass
        try {
            when(jwtInterceptor.preHandle(any(), any(), any())).thenReturn(true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
    }

    @Test
    void create_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.create(any(ServerCreateDto.class))).thenReturn(server);
        ServerCreateDto dto = new ServerCreateDto();
        dto.setServerName("srv");
        dto.setIpAddress("1.2.3.4");
        mockMvc.perform(post("/api/servers").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void create_conflict_serverNameUnique() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.create(any(ServerCreateDto.class)))
                .thenThrow(new DataIntegrityViolationException("server_name unique constraint violation"));
        ServerCreateDto dto = new ServerCreateDto();
        dto.setServerName("srv");
        dto.setIpAddress("1.1.1.1");
        mockMvc.perform(post("/api/servers").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(40901));
    }

    @Test
    void listAll_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.listAll()).thenReturn(List.of(server));
        mockMvc.perform(get("/api/servers").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void overview_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.getServersOverview()).thenReturn(List.of(new ServerOverviewDto()));
        mockMvc.perform(get("/api/servers/overview").requestAttr("userId", 1L))
                .andExpect(status().isOk());
    }

    @Test
    void getById_notFound() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.getById(9L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/servers/9").requestAttr("userId", 1L))
                .andExpect(status().isNotFound());
    }

    @Test
    void getById_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.getById(1L)).thenReturn(Optional.of(server));
        mockMvc.perform(get("/api/servers/1").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void getByName_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.getByName("srv")).thenReturn(Optional.of(server));
        mockMvc.perform(get("/api/servers/by-name/srv").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void listByStatus_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.listByStatus(ServerStatus.online)).thenReturn(List.of(server));
        mockMvc.perform(get("/api/servers/by-status/online").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void update_notFound() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.update(eq(1L), any(ServerUpdateDto.class))).thenReturn(Optional.empty());
        mockMvc.perform(put("/api/servers/1").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ServerUpdateDto())))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.update(eq(1L), any(ServerUpdateDto.class))).thenReturn(Optional.of(server));
        mockMvc.perform(put("/api/servers/1").requestAttr("userId", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ServerUpdateDto())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void updateStatus_notFound() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.updateStatus(1L, ServerStatus.offline)).thenReturn(Optional.empty());
        mockMvc.perform(put("/api/servers/1/status/offline").requestAttr("userId", 1L))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateStatus_ok() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.updateStatus(1L, ServerStatus.offline)).thenReturn(Optional.of(server));
        mockMvc.perform(put("/api/servers/1/status/offline").requestAttr("userId", 1L))
                .andExpect(status().isOk());
    }

    @Test
    void delete_ok_or_notFound() throws Exception {
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
        when(serverService.delete(1L)).thenReturn(true);
        mockMvc.perform(delete("/api/servers/1").requestAttr("userId", 1L))
                .andExpect(status().isOk());

        when(serverService.delete(2L)).thenReturn(false);
        mockMvc.perform(delete("/api/servers/2").requestAttr("userId", 1L))
                .andExpect(status().isNotFound());
    }
}


