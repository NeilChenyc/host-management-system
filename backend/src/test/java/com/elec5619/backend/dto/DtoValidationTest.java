package com.elec5619.backend.dto;

import com.elec5619.backend.entity.ServerStatus;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class DtoValidationTest {

    private static Validator validator;

    @BeforeAll
    static void init() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void serverCreateDto_validation() {
        ServerCreateDto dto = new ServerCreateDto();
        // missing required fields -> violations
        Set<ConstraintViolation<ServerCreateDto>> v1 = validator.validate(dto);
        assertTrue(v1.stream().anyMatch(v -> v.getPropertyPath().toString().equals("serverName")));
        assertTrue(v1.stream().anyMatch(v -> v.getPropertyPath().toString().equals("ipAddress")));

        // set valid minimal fields
        dto.setServerName("ab");
        dto.setIpAddress("1.1.1.1");
        dto.setStatus(ServerStatus.unknown);
        Set<ConstraintViolation<ServerCreateDto>> v2 = validator.validate(dto);
        assertTrue(v2.isEmpty());
    }

    @Test
    void projectCreateDto_validation() {
        ProjectCreateDto dto = new ProjectCreateDto();
        // missing name -> violation
        Set<ConstraintViolation<ProjectCreateDto>> v1 = validator.validate(dto);
        assertTrue(v1.stream().anyMatch(v -> v.getPropertyPath().toString().equals("projectName")));

        dto.setProjectName("ab");
        Set<ConstraintViolation<ProjectCreateDto>> v2 = validator.validate(dto);
        assertTrue(v2.isEmpty());
    }

    @Test
    void loginDto_getters_setters() {
        LoginDto dto = new LoginDto();
        dto.setUsername("u");
        dto.setPassword("p");
        assertEquals("u", dto.getUsername());
        assertEquals("p", dto.getPassword());

        LoginDto dto2 = new LoginDto("u2", "p2");
        assertEquals("u2", dto2.getUsername());
        assertEquals("p2", dto2.getPassword());
        assertTrue(dto2.toString().contains("u2"));
    }
}


