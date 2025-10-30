package com.elec5619.backend.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.ConstraintViolation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class AlertEventCreateDtoValidationTest {
    private Validator validator;

    @BeforeEach
    void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void whenMissingRequired_thenViolations() {
        AlertEventCreateDto dto = new AlertEventCreateDto();
        Set<ConstraintViolation<AlertEventCreateDto>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
    }

    @Test
    void whenSummaryTooLong_thenViolation() {
        AlertEventCreateDto dto = new AlertEventCreateDto();
        dto.setRuleId(1L);
        dto.setServerId(2L);
        dto.setStatus("firing");
        dto.setSummary("x".repeat(600));
        Set<ConstraintViolation<AlertEventCreateDto>> violations = validator.validate(dto);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("summary")));
    }

    @Test
    void whenValid_thenNoViolations() {
        AlertEventCreateDto dto = new AlertEventCreateDto();
        dto.setRuleId(1L);
        dto.setServerId(2L);
        dto.setStatus("firing");
        dto.setSummary("ok");
        Set<ConstraintViolation<AlertEventCreateDto>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }
}
