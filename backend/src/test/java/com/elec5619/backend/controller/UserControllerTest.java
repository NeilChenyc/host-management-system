package com.elec5619.backend.controller;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.dto.UserResponseDto;
import com.elec5619.backend.service.UserService;
import com.elec5619.backend.util.JwtUtil;
import com.elec5619.backend.util.PermissionChecker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.List;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {
    private MockMvc mockMvc;

    @Mock UserService userService;
    @Mock PermissionChecker permissionChecker;
    @Mock JwtUtil jwtUtil;

    @InjectMocks UserController userController;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
    }

    @Test
    @DisplayName("Get all users with valid permission returns 200 and list")
    void getAllUsers_returnsList() throws Exception {
        UserResponseDto dto = new UserResponseDto();
        dto.setUsername("test");
        given(userService.getAllUsers()).willReturn(List.of(dto));
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(1L), eq(PermissionConstants.USER_READ_ALL));

        mockMvc.perform(get("/api/users")
                .requestAttr("userId", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("test"));
    }

    @Test
    void getUserById_found() throws Exception {
        UserResponseDto dto = new UserResponseDto();
        dto.setUsername("foo");
        given(userService.getUserById(123L)).willReturn(Optional.of(dto));
        mockMvc.perform(get("/api/users/123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("foo"));
    }

    @Test
    void getUserById_notFound() throws Exception {
        given(userService.getUserById(789L)).willReturn(Optional.empty());
        mockMvc.perform(get("/api/users/789"))
                .andExpect(status().isNotFound());
    }
}
