package com.elec5619.backend.dto;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class DtoMoreValidationTest {

    private static Validator validator;

    @BeforeAll
    static void init() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void userRegistrationDto_validation_and_getters() {
        UserRegistrationDto dto = new UserRegistrationDto();
        Set<ConstraintViolation<UserRegistrationDto>> v1 = validator.validate(dto);
        assertTrue(v1.stream().anyMatch(v -> v.getPropertyPath().toString().equals("username")));
        assertTrue(v1.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
        assertTrue(v1.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));

        dto.setUsername("user");
        dto.setPassword("123456");
        dto.setEmail("a@b.com");
        assertTrue(validator.validate(dto).isEmpty());

        UserRegistrationDto dto2 = new UserRegistrationDto("u","123456","a@b.com","admin");
        assertEquals("admin", dto2.getRole());
        assertTrue(dto2.toString().contains("u"));
    }

    @Test
    void jwtResponseDto_accessors() {
        JwtResponseDto dto = new JwtResponseDto();
        dto.setAccessToken("t");
        dto.setType("Bearer");
        dto.setId(1L);
        dto.setUsername("u");
        dto.setEmail("e");
        dto.setRole("r");
        assertEquals("t", dto.getToken());
        assertEquals("Bearer", dto.getType());
        assertEquals(1L, dto.getId());
        assertEquals("u", dto.getUsername());
        assertEquals("e", dto.getEmail());
        assertEquals("r", dto.getRole());

        JwtResponseDto dto2 = new JwtResponseDto("x", 2L, "u2", "e2", "r2");
        assertEquals("x", dto2.getAccessToken());
        assertEquals("r2", dto2.getRole());
    }

    @Test
    void alertEventCreateDto_validation_and_accessors() {
        AlertEventCreateDto dto = new AlertEventCreateDto();
        Set<ConstraintViolation<AlertEventCreateDto>> v1 = validator.validate(dto);
        assertTrue(v1.stream().anyMatch(v -> v.getPropertyPath().toString().equals("ruleId")));
        assertTrue(v1.stream().anyMatch(v -> v.getPropertyPath().toString().equals("serverId")));
        assertTrue(v1.stream().anyMatch(v -> v.getPropertyPath().toString().equals("status")));

        dto.setRuleId(1L);
        dto.setServerId(2L);
        dto.setStatus("firing");
        dto.setStartedAt(LocalDateTime.now());
        dto.setTriggeredValue(1.2);
        dto.setSummary("s");
        assertTrue(validator.validate(dto).isEmpty());
    }

    @Test
    void roleUpdateDto_validation_and_toString() {
        RoleUpdateDto dto = new RoleUpdateDto();
        Set<ConstraintViolation<RoleUpdateDto>> v1 = validator.validate(dto);
        assertTrue(v1.stream().anyMatch(v -> v.getPropertyPath().toString().equals("role")));

        dto.setRole("admin");
        assertTrue(validator.validate(dto).isEmpty());

        RoleUpdateDto dto2 = new RoleUpdateDto("manager");
        assertTrue(dto2.toString().contains("manager"));
    }

    @Test
    void userResponseDto_accessors() {
        LocalDateTime now = LocalDateTime.now();
        UserResponseDto dto = new UserResponseDto(1L, "u", "e", now, "r");
        assertEquals(1L, dto.getId());
        assertEquals("u", dto.getUsername());
        assertEquals("e", dto.getEmail());
        assertEquals(now, dto.getCreatedAt());
        assertEquals("r", dto.getRole());
        assertTrue(dto.toString().contains("u"));
    }
}


