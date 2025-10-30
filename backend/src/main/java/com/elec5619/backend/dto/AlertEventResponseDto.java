package com.elec5619.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO for Alert Event responses with server name and rule name
 */
public class AlertEventResponseDto {
    private Long eventId;
    private Long serverId;
    private String serverName;
    private String ruleName;
    private Double threshold;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime resolvedAt;
    private Double triggeredValue;
    private String summary;
    private LocalDateTime createdAt;

    // Default constructor
    public AlertEventResponseDto() {}

    // Getters and Setters
    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getServerId() {
        return serverId;
    }

    public void setServerId(Long serverId) {
        this.serverId = serverId;
    }

    public String getServerName() {
        return serverName;
    }

    public void setServerName(String serverName) {
        this.serverName = serverName;
    }

    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public Double getThreshold() {
        return threshold;
    }

    public void setThreshold(Double threshold) {
        this.threshold = threshold;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}