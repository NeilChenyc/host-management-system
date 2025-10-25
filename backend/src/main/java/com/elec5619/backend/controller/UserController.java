package com.elec5619.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.dto.RoleUpdateDto;
import com.elec5619.backend.dto.UserResponseDto;
import com.elec5619.backend.exception.GlobalExceptionHandler;
import com.elec5619.backend.service.UserService;
import com.elec5619.backend.util.PermissionChecker;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * User management controller.
 * Provides REST endpoints for user CRUD operations.
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "User management and administration APIs")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private PermissionChecker permissionChecker;

    /**
     * Get all users
     * @return List of all users
     */
    @GetMapping
    @Operation(
        summary = "Get All Users",
        description = "Retrieve a list of all users in the system. All authenticated users can view the user list."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Users retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserResponseDto.class)
            )
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<List<UserResponseDto>> getAllUsers(
            @Parameter(hidden = true) @org.springframework.web.bind.annotation.RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看用户列表（只读）
        permissionChecker.requirePermission(userId, PermissionConstants.USER_READ_ALL);
        
        List<UserResponseDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by ID
     * @param id User ID
     * @return User information
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Get User by ID",
        description = "Retrieve user information by user ID"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found"
        )
    })
    public ResponseEntity<UserResponseDto> getUserById(
            @Parameter(description = "User ID", required = true)
            @PathVariable Long id) {
        // 从数据库获取真实用户数据
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update user role
     * @param id User ID
     * @param role New role
     * @return Updated user information
     */
    @PutMapping("/{id}/role")
    @Operation(
        summary = "Update User Role",
        description = "Update the role assigned to a specific user. Requires Admin or Manager role."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User role updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - invalid or missing JWT token"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - insufficient permissions"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found"
        )
    })
    public ResponseEntity<?> updateUserRole(
            @Parameter(description = "User ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "New role for the user", required = true)
            @RequestBody RoleUpdateDto roleUpdateDto,
            @Parameter(hidden = true) @org.springframework.web.bind.annotation.RequestAttribute("userId") Long currentUserId) {
        // 只有Admin和Manager可以更新用户角色
        permissionChecker.requirePermission(currentUserId, PermissionConstants.USER_MANAGE_ALL);
        
        try {
            // 实际更新数据库中的用户角色
            Optional<UserResponseDto> updatedUser = userService.updateUserRole(id, roleUpdateDto.getRole());
            
            if (updatedUser.isPresent()) {
                return ResponseEntity.ok(updatedUser.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            // Handle any other exceptions
            GlobalExceptionHandler.ErrorResponse errorResponse = new GlobalExceptionHandler.ErrorResponse(
                java.time.LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to update user role: " + e.getMessage(),
                null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Delete user
     * @param id User ID
     * @return Success response
     */
    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete User",
        description = "Delete a user from the system"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User deleted successfully"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found"
        )
    })
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID", required = true)
            @PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/by-username/{username}")
    @Operation(
        summary = "Get User by Username",
        description = "Retrieve user information by username"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found"
        )
    })
    public ResponseEntity<UserResponseDto> getByUsername(
            @Parameter(description = "Username", required = true)
            @PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
