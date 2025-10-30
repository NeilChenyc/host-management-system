package com.elec5619.backend.controller;

import com.elec5619.backend.dto.UserRegistrationDto;
import com.elec5619.backend.dto.UserResponseDto;
import com.elec5619.backend.service.UserService;
import com.elec5619.backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {
    private MockMvc mockMvc;
    @Mock UserService userService;
    @Mock JwtUtil jwtUtil;
    @InjectMocks AuthController authController;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void signup_created() throws Exception {
        UserResponseDto user = new UserResponseDto(); user.setId(1L); user.setUsername("user123"); user.setEmail("e@mail.com");
        given(userService.createUser(any(UserRegistrationDto.class))).willReturn(user);
        String body = "{\"username\":\"user123\",\"email\":\"e@mail.com\",\"password\":\"pass123\"}";
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void signin_ok() throws Exception {
        UserResponseDto user = new UserResponseDto(); user.setId(2L); user.setUsername("u2"); user.setRole("admin");
        given(userService.authenticateUser("u2", "p")).willReturn(Optional.of(user));
        given(jwtUtil.generateToken(2L, "u2", "admin")).willReturn("jwt");
        String body = "{\"username\":\"u2\",\"password\":\"p\"}";
        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt"));
    }
}
