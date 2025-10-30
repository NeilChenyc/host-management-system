package com.elec5619.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * DTO for updating user information
 */
@Schema(description = "User update request")
public class UserUpdateDto {
    
    @Schema(description = "New username", example = "newusername")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @Schema(description = "New email address", example = "newemail@example.com")
    @Email(message = "Email should be valid")
    private String email;
    
    @Schema(description = "Current password for verification", example = "currentpassword")
    private String currentPassword;
    
    @Schema(description = "New password", example = "newpassword")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String newPassword;

    // Constructors
    public UserUpdateDto() {}

    public UserUpdateDto(String username, String email, String currentPassword, String newPassword) {
        this.username = username;
        this.email = email;
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}