package com.elec5619.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * DTO for creating AlertEvent
 * Contains all necessary fields for creating a new alert event
 */
public class AlertEventCreateDto {
    
    @NotNull(message = "Rule ID is required")
    private Long ruleId;

    @NotNull(message = "Server ID is required")
    private Long serverId;

    @NotBlank(message = "Status is required")
    @Size(max = 50, message = "Status must not exceed 50 characters")
    private String status;

    private LocalDateTime startedAt;

    private LocalDateTime resolvedAt;

    private Double triggeredValue;

    @Size(max = 500, message = "Summary must not exceed 500 characters")
    private String summary;

    // Default constructor
    public AlertEventCreateDto() {}

    // Getters and Setters
    public Long getRuleId() {
        return ruleId;
    }

    public void setRuleId(Long ruleId) {
        this.ruleId = ruleId;
    }

    public Long getServerId() {
        return serverId;
    }

    public void setServerId(Long serverId) {
        this.serverId = serverId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public Double getTriggeredValue() {
        return triggeredValue;
    }

    public void setTriggeredValue(Double triggeredValue) {
        this.triggeredValue = triggeredValue;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}