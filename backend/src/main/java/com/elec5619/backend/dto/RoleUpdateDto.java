package com.elec5619.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for updating user role
 */
public class RoleUpdateDto {
    
    @NotBlank(message = "Role is required")
    @Size(max = 50, message = "Role name must not exceed 50 characters")
    private String role;
    
    public RoleUpdateDto() {}
    
    public RoleUpdateDto(String role) {
        this.role = role;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    @Override
    public String toString() {
        return "RoleUpdateDto{" +
                "role='" + role + '\'' +
                '}';
    }
}
