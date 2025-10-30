package com.elec5619.backend.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.ConstraintViolation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class ProjectCreateDtoValidationTest {
    private Validator validator;

    @BeforeEach
    void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void whenProjectNameBlank_thenViolation() {
        ProjectCreateDto dto = new ProjectCreateDto();
        dto.setProjectName("");
        Set<ConstraintViolation<ProjectCreateDto>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
    }

    @Test
    void whenProjectNameTooShort_thenViolation() {
        ProjectCreateDto dto = new ProjectCreateDto();
        dto.setProjectName("a");
        Set<ConstraintViolation<ProjectCreateDto>> violations = validator.validate(dto);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("projectName")));
    }

    @Test
    void whenValid_thenNoViolations() {
        ProjectCreateDto dto = new ProjectCreateDto();
        dto.setProjectName("ab");
        Set<ConstraintViolation<ProjectCreateDto>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }
}
