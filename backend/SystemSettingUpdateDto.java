package com.elec5619.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SystemSettingUpdateDto {
    @NotBlank
    private String value;

    @Size(max = 255)
    private String description;

    // Getters & Setters
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
