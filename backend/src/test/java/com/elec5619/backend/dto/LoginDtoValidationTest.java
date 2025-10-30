package com.elec5619.backend.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.ConstraintViolation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class LoginDtoValidationTest {
    private Validator validator;

    @BeforeEach
    void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void whenMissingFields_thenViolations() {
        LoginDto dto = new LoginDto();
        Set<ConstraintViolation<LoginDto>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
    }

    @Test
    void whenValid_thenNoViolations() {
        LoginDto dto = new LoginDto();
        dto.setUsername("u");
        dto.setPassword("p");
        Set<ConstraintViolation<LoginDto>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }
}
