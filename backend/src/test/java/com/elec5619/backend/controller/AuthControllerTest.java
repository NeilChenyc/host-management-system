package com.elec5619.backend.controller;

import com.elec5619.backend.dto.UserRegistrationDto;
import com.elec5619.backend.dto.UserResponseDto;
import com.elec5619.backend.service.UserService;
import com.elec5619.backend.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class})
class AuthControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean UserService userService;
    @MockBean JwtUtil jwtUtil;

    @Test
    void signup_created() throws Exception {
        UserResponseDto user = new UserResponseDto(); user.setId(1L); user.setUsername("u"); user.setEmail("e@mail");
        given(userService.createUser(any(UserRegistrationDto.class))).willReturn(user);
        String body = "{\"username\":\"u\",\"email\":\"e@mail\",\"password\":\"p\"}";
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
