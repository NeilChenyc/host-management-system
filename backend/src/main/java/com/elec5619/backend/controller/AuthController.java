package com.elec5619.backend.controller;

import com.elec5619.backend.dto.JwtResponseDto;
import com.elec5619.backend.dto.LoginDto;
import com.elec5619.backend.dto.UserRegistrationDto;
import com.elec5619.backend.dto.UserResponseDto;
import com.elec5619.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.Optional;

/**
 * Authentication controller for user registration and login.
 * Provides REST endpoints for user authentication operations.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and registration APIs")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * Register a new user
     * @param registrationDto User registration data
     * @return User response with created user information
     */
    @PostMapping("/signup")
    @Operation(
        summary = "User Registration",
        description = "Register a new user with username, email, and password"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "User created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserResponseDto.class),
                examples = @ExampleObject(
                    name = "Success Response",
                    value = "{\"id\": 1, \"username\": \"john_doe\", \"email\": \"john@example.com\", \"roles\": [\"ROLE_USER\"]}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data or user already exists"
        )
    })
    public ResponseEntity<UserResponseDto> registerUser(
            @Parameter(description = "User registration data", required = true)
            @Valid @RequestBody UserRegistrationDto registrationDto) {
        
        UserResponseDto createdUser = userService.createUser(registrationDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    /**
     * Authenticate user login using signin path
     * @param loginDto User login credentials
     * @return JWT response with authentication token
     */
    @PostMapping("/signin")
    @Operation(
        summary = "User Login",
        description = "Authenticate user with username/email and password"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Login successful",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = JwtResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Invalid credentials"
        )
    })
    public ResponseEntity<?> signin(
            @Parameter(description = "User login credentials", required = true)
            @Valid @RequestBody LoginDto loginDto) {
        try {
            // 使用UserService的authenticateUser方法验证用户凭据
            Optional<UserResponseDto> authenticatedUserOpt = 
                userService.authenticateUser(loginDto.getUsername(), loginDto.getPassword());
            
            if (authenticatedUserOpt.isEmpty()) {
                // 认证失败，用户不存在或密码不正确
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username/email or password");
            }
            
            // 认证成功，创建响应对象
            UserResponseDto user = authenticatedUserOpt.get();
            JwtResponseDto response = new JwtResponseDto();
            response.setToken("mock-jwt-token"); // 在实际应用中，应该生成真实的JWT令牌
            response.setType("Bearer");
            response.setId(user.getId());
            response.setUsername(user.getUsername());
            response.setEmail(user.getEmail());
            response.setRoles(user.getRoles().toArray(new String[0]));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Signin failed: " + e.getMessage());
        }
    }
    
    /**
     * Get current authenticated user information
     * @return Current user information
     */
    @GetMapping("/me")
    @Operation(
        summary = "Get Current User",
        description = "Retrieve information about the currently authenticated user"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User information retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User not authenticated"
        )
    })
    public ResponseEntity<UserResponseDto> getCurrentUser() {
        // For now, return a mock response
        UserResponseDto user = new UserResponseDto();
        user.setId(1L);
        user.setUsername("current_user");
        user.setEmail("current@example.com");
        user.setRoles(Set.of("ROLE_USER"));
        
        return ResponseEntity.ok(user);
    }
}
