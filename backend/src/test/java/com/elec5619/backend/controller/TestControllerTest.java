package com.elec5619.backend.controller;

import com.elec5619.backend.config.TestSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TestController.class)
@Import(TestSecurityConfig.class)
class TestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testPublicTestEndpoint_Success() throws Exception {
        mockMvc.perform(get("/api/public/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("Public Content."));
    }

    @Test
    void testHealthCheckEndpoint_Success() throws Exception {
        mockMvc.perform(get("/api/public/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("Application is running successfully!"));
    }

    @Test
    void testPublicTestEndpoint_WithDifferentMethods() throws Exception {
        // Test that only GET is allowed
        mockMvc.perform(get("/api/public/test"))
                .andExpect(status().isOk());
    }

    @Test
    void testHealthCheckEndpoint_WithDifferentMethods() throws Exception {
        // Test that only GET is allowed
        mockMvc.perform(get("/api/public/health"))
                .andExpect(status().isOk());
    }

    @Test
    void testCorsHeaders() throws Exception {
        mockMvc.perform(get("/api/public/test")
                .header("Origin", "http://localhost:3000"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }

    @Test
    void testHealthCheckCorsHeaders() throws Exception {
        mockMvc.perform(get("/api/public/health")
                .header("Origin", "http://localhost:3000"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }
}
