package com.elec5619.backend.service;

import com.elec5619.backend.dto.UserRegistrationDto;
import com.elec5619.backend.dto.UserResponseDto;
import com.elec5619.backend.entity.User;
import com.elec5619.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceUnitTest {
    @Mock UserRepository userRepository;
    @InjectMocks UserService userService;

    @BeforeEach void setUp() { MockitoAnnotations.openMocks(this); }

    @Test void createUser_duplicateUsernameThrows() {
        var reg = new UserRegistrationDto();
        reg.setUsername("x"); reg.setEmail("y@mail.com"); reg.setPassword("p");
        when(userRepository.findByUsername("x")).thenReturn(Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(reg));
    }
    @Test void createUser_duplicateEmailThrows() {
        var reg = new UserRegistrationDto();
        reg.setUsername("x"); reg.setEmail("y@mail.com"); reg.setPassword("p");
        when(userRepository.findByUsername("x")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("y@mail.com")).thenReturn(Optional.of(new User()));
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(reg));
    }
    @Test void createUser_normalSetsDefaultRole() {
        var reg = new UserRegistrationDto();
        reg.setUsername("x1"); reg.setEmail("y1@mail.com"); reg.setPassword("p");
        reg.setRole("");
        when(userRepository.findByUsername("x1")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("y1@mail.com")).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenAnswer(inv->inv.getArgument(0));
        UserResponseDto dto = userService.createUser(reg);
        assertEquals("x1", dto.getUsername());
        assertEquals("operation", dto.getRole());
    }
    @Test void updateUserRole_notFoundReturnsEmpty() {
        when(userRepository.findById(2L)).thenReturn(Optional.empty());
        assertTrue(userService.updateUserRole(2L, "admin").isEmpty());
    }
    @Test void updateUserRole_foundUpdates() {
        var u = new User(); u.setId(3L); u.setRole("old");
        when(userRepository.findById(3L)).thenReturn(Optional.of(u));
        when(userRepository.save(any())).thenReturn(u);
        assertEquals("admin", userService.updateUserRole(3L, "admin").get().getRole());
    }
    @Test void deleteUser_existsTrueNotExistsFalse() {
        when(userRepository.existsById(1L)).thenReturn(true);
        assertTrue(userService.deleteUser(1L));
        when(userRepository.existsById(2L)).thenReturn(false);
        assertFalse(userService.deleteUser(2L));
    }
}
