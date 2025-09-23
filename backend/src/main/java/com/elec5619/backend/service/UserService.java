package com.elec5619.backend.service;

import com.elec5619.backend.dto.UserRegistrationDto;
import com.elec5619.backend.dto.UserResponseDto;
import com.elec5619.backend.entity.Role;
import com.elec5619.backend.entity.User;
import com.elec5619.backend.repository.RoleRepository;
import com.elec5619.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Service class for user-related business logic.
 * Handles user creation, retrieval, and management operations.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;
    
    // Password encoder for hashing and verifying passwords
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Create a new user
     * @param registrationDto User registration data
     * @return Created user response
     */
    public UserResponseDto createUser(UserRegistrationDto registrationDto) {
        // Check if username already exists
        if (userRepository.findByUsername(registrationDto.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.findByEmail(registrationDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        
        // Hash the password before storing it
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));

        // Set default role (ROLE_USER)
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName("ROLE_USER").orElseGet(() -> {
            // Create ROLE_USER if it doesn't exist
            Role newRole = new Role("ROLE_USER");
            return roleRepository.save(newRole);
        });
        roles.add(userRole);
        user.setRoles(roles);

        // Save user
        User savedUser = userRepository.save(user);

        // Convert to DTO and return
        return convertToUserResponseDto(savedUser);
    }

    /**
     * Get user by username
     * @param username Username to search for
     * @return Optional containing user if found
     */
    public Optional<UserResponseDto> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::convertToUserResponseDto);
    }

    /**
     * Get user by email
     * @param email Email to search for
     * @return Optional containing user if found
     */
    public Optional<UserResponseDto> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::convertToUserResponseDto);
    }

    /**
     * Convert User entity to UserResponseDto
     * @param user User entity
     * @return UserResponseDto
     */
    private UserResponseDto convertToUserResponseDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setCreatedAt(user.getCreatedAt());
        
        // Convert roles to string array
        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(java.util.stream.Collectors.toSet());
        dto.setRoles(roleNames);
        
        return dto;
    }
    
    /**
     * Authenticate user by username/email and password
     * @param usernameOrEmail Username or email of the user
     * @param password Raw password to verify
     * @return Optional containing user if authentication is successful
     */
    public Optional<UserResponseDto> authenticateUser(String usernameOrEmail, String password) {
        // First try to find by username
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail);
        
        // If not found, try by email
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(usernameOrEmail);
        }
        
        // Check if user exists and password matches
        return userOpt.filter(user -> passwordEncoder.matches(password, user.getPasswordHash()))
                .map(this::convertToUserResponseDto);
    }
}
