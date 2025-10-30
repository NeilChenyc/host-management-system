package com.elec5619.backend.controller;

import com.elec5619.backend.config.WebConfig;
import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.dto.UserResponseDto;
import com.elec5619.backend.service.UserService;
import com.elec5619.backend.util.PermissionChecker;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.boot.test.mock.mockito.MockBean; // TODO: If upgrade Spring Boot 3.4+ may need alternative to MockBean
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UserController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class},
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebConfig.class))
class UserControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean UserService userService;
    @MockBean PermissionChecker permissionChecker;

    @Test
    @DisplayName("Get all users with valid permission returns 200 and list")
    void getAllUsers_returnsList() throws Exception {
        UserResponseDto dto = new UserResponseDto();
        dto.setUsername("test");
        given(userService.getAllUsers()).willReturn(List.of(dto));
        Mockito.doNothing().when(permissionChecker).requirePermission(eq(1L), eq(PermissionConstants.USER_READ_ALL));

        mockMvc.perform(get("/api/users").requestAttr("userId", 1L))
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
