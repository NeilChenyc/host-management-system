package com.elec5619.backend.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.ConstraintViolation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class UserRegistrationDtoValidationTest {
    private Validator validator;

    @BeforeEach
    void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void whenFieldsMissing_thenViolations() {
        UserRegistrationDto dto = new UserRegistrationDto();
        Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
    }

    @Test
    void whenInvalidEmail_thenViolation() {
        UserRegistrationDto dto = new UserRegistrationDto();
        dto.setUsername("abc");
        dto.setPassword("123456");
        dto.setEmail("bad-email");
        Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void whenValid_thenNoViolations() {
        UserRegistrationDto dto = new UserRegistrationDto();
        dto.setUsername("validUser");
        dto.setPassword("strongPass");
        dto.setEmail("a@b.com");
        Set<ConstraintViolation<UserRegistrationDto>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }
}
