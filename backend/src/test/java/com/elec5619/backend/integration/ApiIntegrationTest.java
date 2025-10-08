package com.elec5619.backend.integration;

import com.elec5619.backend.dto.LoginDto;
import com.elec5619.backend.dto.UserRegistrationDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import com.elec5619.backend.config.TestSecurityConfig;
import org.springframework.context.annotation.Import;

@SpringBootTest
@AutoConfigureWebMvc
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
class ApiIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void testCompleteUserRegistrationFlow() throws Exception {
        // Test user registration
        UserRegistrationDto registrationDto = new UserRegistrationDto();
        registrationDto.setUsername("integrationuser");
        registrationDto.setPassword("password123");
        registrationDto.setEmail("integration@example.com");
        registrationDto.setRoles(Set.of("ROLE_USER"));

        mockMvc.perform(post("/api/auth/signup")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("integrationuser"))
                .andExpect(jsonPath("$.email").value("integration@example.com"));
    }

    @Test
    void testPublicEndpointsAccessibility() throws Exception {
        // Test public test endpoint
        mockMvc.perform(get("/api/public/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("Public Content."));

        // Test health check endpoint
        mockMvc.perform(get("/api/public/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("Application is running successfully!"));
    }

    @Test
    void testUserManagementEndpoints() throws Exception {
        // Test get all users
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Test get user by ID
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));

        // Test get user by username
        mockMvc.perform(get("/api/users/by-username/testuser"))
                .andExpect(status().isNotFound()); // User doesn't exist in test context

        // Test update user roles
        Set<String> newRoles = Set.of("ROLE_USER", "ROLE_ADMIN");
        mockMvc.perform(put("/api/users/1/roles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRoles)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));

        // Test delete user
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testAuthenticationEndpoints() throws Exception {
        // Test get current user (mock endpoint)
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("current_user"));

        // Test login with invalid credentials
        LoginDto loginDto = new LoginDto();
        loginDto.setUsername("nonexistent");
        loginDto.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/signin")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testValidationErrors() throws Exception {
        // Test registration with invalid data
        UserRegistrationDto invalidDto = new UserRegistrationDto();
        invalidDto.setUsername("ab"); // Too short
        invalidDto.setPassword("123"); // Too short
        invalidDto.setEmail("invalid-email"); // Invalid email

        mockMvc.perform(post("/api/auth/signup")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());

        // Test login with empty credentials
        LoginDto emptyLoginDto = new LoginDto();
        emptyLoginDto.setUsername("");
        emptyLoginDto.setPassword("");

        mockMvc.perform(post("/api/auth/signin")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyLoginDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCorsConfiguration() throws Exception {
        // Test CORS headers are present
        mockMvc.perform(get("/api/public/test")
                .header("Origin", "http://localhost:3000"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));

        mockMvc.perform(get("/api/users")
                .header("Origin", "http://localhost:3000"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }
}
