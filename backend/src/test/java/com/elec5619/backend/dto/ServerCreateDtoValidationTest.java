package com.elec5619.backend.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.ConstraintViolation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class ServerCreateDtoValidationTest {
    private Validator validator;

    @BeforeEach
    void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void whenMissingRequired_thenViolations() {
        ServerCreateDto dto = new ServerCreateDto();
        Set<ConstraintViolation<ServerCreateDto>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
    }

    @Test
    void whenValid_thenNoViolations() {
        ServerCreateDto dto = new ServerCreateDto();
        dto.setServerName("web-01");
        dto.setIpAddress("192.168.0.1");
        Set<ConstraintViolation<ServerCreateDto>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }
}
