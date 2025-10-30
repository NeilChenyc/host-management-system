package com.elec5619.backend.controller;

import com.elec5619.backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TestControllerTest {
    private MockMvc mockMvc;
    @Mock JwtUtil jwtUtil;
    @InjectMocks TestController testController;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(testController).build();
    }

    @Test
    void publicTest_ok() throws Exception {
        mockMvc.perform(get("/api/public/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("Public Content."));
    }
}
