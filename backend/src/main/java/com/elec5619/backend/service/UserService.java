package com.elec5619.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elec5619.backend.dto.UserRegistrationDto;
import com.elec5619.backend.dto.UserResponseDto;
import com.elec5619.backend.entity.User;
import com.elec5619.backend.repository.UserRepository;

/**
 * Service class for user-related business logic.
 * Handles user creation, retrieval, and management operations.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
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

        // Set role from registration data, default to "operation" if not provided
        user.setRole(registrationDto.getRole() != null && !registrationDto.getRole().trim().isEmpty() 
                ? registrationDto.getRole() : "operation");

        // Save user
        User savedUser = userRepository.save(user);

        // Convert to DTO and return
        return convertToUserResponseDto(savedUser);
    }

    /**
     * Get all users
     * @return List of all users
     */
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToUserResponseDto)
                .collect(java.util.stream.Collectors.toList());
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
     * Get user by ID
     * @param id User ID to search for
     * @return Optional containing user if found
     */
    public Optional<UserResponseDto> getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToUserResponseDto);
    }

    /**
     * Update user role
     * @param id User ID
     * @param role New role
     * @return Optional containing updated user if found
     */
    @Transactional
    public Optional<UserResponseDto> updateUserRole(Long id, String role) {
        System.out.println("DEBUG: updateUserRole called with id=" + id + ", role=" + role);
        return userRepository.findById(id)
                .map(user -> {
                    System.out.println("DEBUG: Found user: " + user.getUsername() + ", current role: " + user.getRole());
                    user.setRole(role);
                    User savedUser = userRepository.save(user);
                    System.out.println("DEBUG: Saved user role: " + savedUser.getRole());
                    return convertToUserResponseDto(savedUser);
                });
    }

    /**
     * Delete user by ID
     * @param id User ID
     * @return true if user was deleted, false if user not found
     */
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
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
        
        // Set role
        dto.setRole(user.getRole());
        
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