package com.elec5619.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SystemSettingCreateDto {
    @NotBlank
    @Size(max = 100)
    private String key;

    @NotBlank
    private String value;

    @Size(max = 255)
    private String description;

    // Getters & Setters
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
