package com.elec5619.backend.controller;

import com.elec5619.backend.dto.JwtResponseDto;
import com.elec5619.backend.dto.LoginDto;
import com.elec5619.backend.dto.UserRegistrationDto;
import com.elec5619.backend.dto.UserResponseDto;
import com.elec5619.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import com.elec5619.backend.config.TestSecurityConfig;
import org.springframework.context.annotation.Import;
import com.elec5619.backend.interceptor.JwtInterceptor;
import com.elec5619.backend.util.JwtUtil;

@WebMvcTest(controllers = AuthController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.elec5619.backend.config.WebConfig.class))
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtInterceptor jwtInterceptor;

    @MockBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private UserRegistrationDto validRegistrationDto;
    private UserResponseDto mockUserResponse;
    private LoginDto validLoginDto;
    private JwtResponseDto mockJwtResponse;

    @BeforeEach
    void setUp() {
        // Setup valid registration data
        validRegistrationDto = new UserRegistrationDto();
        validRegistrationDto.setUsername("testuser");
        validRegistrationDto.setPassword("password123");
        validRegistrationDto.setEmail("test@example.com");
        validRegistrationDto.setRole("operation");

        // Setup mock user response
        mockUserResponse = new UserResponseDto();
        mockUserResponse.setId(1L);
        mockUserResponse.setUsername("testuser");
        mockUserResponse.setEmail("test@example.com");
        mockUserResponse.setRole("operation");

        // Setup valid login data
        validLoginDto = new LoginDto();
        validLoginDto.setUsername("testuser");
        validLoginDto.setPassword("password123");

        // Setup mock JWT response
        mockJwtResponse = new JwtResponseDto();
        mockJwtResponse.setToken("mock-jwt-token");
        mockJwtResponse.setType("Bearer");
        mockJwtResponse.setId(1L);
        mockJwtResponse.setUsername("testuser");
        mockJwtResponse.setEmail("test@example.com");
        mockJwtResponse.setRole("operation");
    }

    @Test
    void testSignup_Success() throws Exception {
        when(userService.createUser(any(UserRegistrationDto.class))).thenReturn(mockUserResponse);

        mockMvc.perform(post("/api/auth/signup")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegistrationDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("operation"));
    }

    @Test
    void testSignup_InvalidData() throws Exception {
        UserRegistrationDto invalidDto = new UserRegistrationDto();
        invalidDto.setUsername("ab"); // Too short
        invalidDto.setPassword("123"); // Too short
        invalidDto.setEmail("invalid-email"); // Invalid email

        mockMvc.perform(post("/api/auth/signup")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSignup_UsernameAlreadyExists() throws Exception {
        when(userService.createUser(any(UserRegistrationDto.class)))
                .thenThrow(new RuntimeException("Username already exists"));

        mockMvc.perform(post("/api/auth/signup")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegistrationDto)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testSignin_Success() throws Exception {
        when(userService.authenticateUser(anyString(), anyString()))
                .thenReturn(Optional.of(mockUserResponse));
        when(jwtUtil.generateToken(1L, "testuser", "operation")).thenReturn("mock-jwt-token");

        mockMvc.perform(post("/api/auth/signin")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("operation"));
    }

    @Test
    void testSignin_InvalidCredentials() throws Exception {
        when(userService.authenticateUser(anyString(), anyString()))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/signin")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginDto)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid username/email or password"));
    }

    @Test
    void testSignin_InvalidData() throws Exception {
        LoginDto invalidDto = new LoginDto();
        invalidDto.setUsername(""); // Empty username
        invalidDto.setPassword(""); // Empty password

        mockMvc.perform(post("/api/auth/signin")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSignin_ServiceException() throws Exception {
        when(userService.authenticateUser(anyString(), anyString()))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/api/auth/signin")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginDto)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testGetCurrentUser_Success() throws Exception {
        when(jwtUtil.extractUserId("abc")).thenReturn(1L);
        when(userService.getUserById(1L)).thenReturn(Optional.of(mockUserResponse));
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("operation"));
    }
}
