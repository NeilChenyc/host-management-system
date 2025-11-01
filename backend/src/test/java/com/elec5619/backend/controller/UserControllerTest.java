package com.elec5619.backend.controller;

import com.elec5619.backend.dto.UserResponseDto;
import com.elec5619.backend.dto.RoleUpdateDto;
import com.elec5619.backend.service.UserService;
import com.elec5619.backend.util.PermissionChecker;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import com.elec5619.backend.interceptor.JwtInterceptor;
import com.elec5619.backend.util.JwtUtil;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import com.elec5619.backend.config.TestSecurityConfig;
import org.springframework.context.annotation.Import;

@WebMvcTest(controllers = UserController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.elec5619.backend.config.WebConfig.class))
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private PermissionChecker permissionChecker;

    @MockitoBean
    private JwtInterceptor jwtInterceptor;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private UserResponseDto mockUserResponse;

    @BeforeEach
    void setUp() {
        mockUserResponse = new UserResponseDto();
        mockUserResponse.setId(1L);
        mockUserResponse.setUsername("testuser");
        mockUserResponse.setEmail("test@example.com");
        mockUserResponse.setRole("operation");
        doNothing().when(permissionChecker).requirePermission(anyLong(), anyString());
    }

    @Test
    void testGetAllUsers_Success() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of());
        mockMvc.perform(get("/api/users").requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void testGetUserById_Success() throws Exception {
        when(userService.getUserById(1L)).thenReturn(Optional.of(mockUserResponse));
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("operation"));
    }

    @Test
    void testGetUserById_WithDifferentId() throws Exception {
        UserResponseDto user999 = new UserResponseDto();
        user999.setId(999L);
        user999.setUsername("user_999");
        user999.setEmail("user999@example.com");
        user999.setRole("operation");
        when(userService.getUserById(999L)).thenReturn(Optional.of(user999));
        mockMvc.perform(get("/api/users/999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(999))
                .andExpect(jsonPath("$.username").value("user_999"))
                .andExpect(jsonPath("$.email").value("user999@example.com"))
                .andExpect(jsonPath("$.role").value("operation"));
    }

    @Test
    void testGetUserByUsername_Success() throws Exception {
        when(userService.getUserByUsername("testuser"))
                .thenReturn(Optional.of(mockUserResponse));

        mockMvc.perform(get("/api/users/by-username/testuser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("operation"));
    }

    @Test
    void testGetUserByUsername_NotFound() throws Exception {
        when(userService.getUserByUsername("nonexistent"))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/by-username/nonexistent"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateUserRole_Success() throws Exception {
        String newRole = "admin";
        RoleUpdateDto dto = new RoleUpdateDto();
        dto.setRole(newRole);
        mockUserResponse.setRole(newRole);
        when(userService.updateUserRole(1L, newRole)).thenReturn(Optional.of(mockUserResponse));
        mockMvc.perform(put("/api/users/1/role")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("admin"));
    }

    @Test
    void testUpdateUserRole_EmptyRole() throws Exception {
        String emptyRole = "";
        RoleUpdateDto dto = new RoleUpdateDto();
        dto.setRole(emptyRole);
        mockUserResponse.setRole(emptyRole);
        when(userService.updateUserRole(1L, emptyRole)).thenReturn(Optional.of(mockUserResponse));
        mockMvc.perform(put("/api/users/1/role")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.role").value(""));
    }

    @Test
    void testUpdateUserRole_InvalidJson() throws Exception {
        mockMvc.perform(put("/api/users/1/role")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("invalid json")
                .requestAttr("userId", 1L))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateUserRole_ServiceException() throws Exception {
        String newRole = "admin";
        RoleUpdateDto dto = new RoleUpdateDto();
        dto.setRole(newRole);
        when(userService.updateUserRole(1L, newRole)).thenReturn(Optional.empty());
        mockMvc.perform(put("/api/users/1/role")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .requestAttr("userId", 1L))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDeleteUser_Success() throws Exception {
        when(userService.deleteUser(1L)).thenReturn(true);
        mockMvc.perform(delete("/api/users/1")
                .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteUser_WithDifferentId() throws Exception {
        when(userService.deleteUser(999L)).thenReturn(true);
        mockMvc.perform(delete("/api/users/999"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetUserById_InvalidId() throws Exception {
        mockMvc.perform(get("/api/users/invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateUserRole_InvalidId() throws Exception {
        String newRole = "admin";
        
        mockMvc.perform(put("/api/users/invalid/role")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRole)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testDeleteUser_InvalidId() throws Exception {
        mockMvc.perform(delete("/api/users/invalid")
                .with(csrf()))
                .andExpect(status().isBadRequest());
    }
}
