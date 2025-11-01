package com.elec5619.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO for Alert Event responses with server name and rule name
 */
public class AlertEventResponseDto {
    private Long eventId;
    private Long serverId;
    private String serverName;

    // Complete rule information
    private Long ruleId;
    private String ruleName;
    private String ruleDescription;
    private String targetMetric;
    private String comparator;
    private Double threshold;
    private Integer duration;
    private String severity;
    private Boolean enabled;
    private String scopeLevel;
    private String targetFilter;
    private LocalDateTime ruleCreatedAt;
    private LocalDateTime ruleUpdatedAt;

    // Alert event information
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

    public Long getRuleId() {
        return ruleId;
    }

    public void setRuleId(Long ruleId) {
        this.ruleId = ruleId;
    }

    public String getRuleDescription() {
        return ruleDescription;
    }

    public void setRuleDescription(String ruleDescription) {
        this.ruleDescription = ruleDescription;
    }

    public String getTargetMetric() {
        return targetMetric;
    }

    public void setTargetMetric(String targetMetric) {
        this.targetMetric = targetMetric;
    }

    public String getComparator() {
        return comparator;
    }

    public void setComparator(String comparator) {
        this.comparator = comparator;
    }

    public Double getThreshold() {
        return threshold;
    }

    public void setThreshold(Double threshold) {
        this.threshold = threshold;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public String getScopeLevel() {
        return scopeLevel;
    }

    public void setScopeLevel(String scopeLevel) {
        this.scopeLevel = scopeLevel;
    }

    public String getTargetFilter() {
        return targetFilter;
    }

    public void setTargetFilter(String targetFilter) {
        this.targetFilter = targetFilter;
    }

    public LocalDateTime getRuleCreatedAt() {
        return ruleCreatedAt;
    }

    public void setRuleCreatedAt(LocalDateTime ruleCreatedAt) {
        this.ruleCreatedAt = ruleCreatedAt;
    }

    public LocalDateTime getRuleUpdatedAt() {
        return ruleUpdatedAt;
    }

    public void setRuleUpdatedAt(LocalDateTime ruleUpdatedAt) {
        this.ruleUpdatedAt = ruleUpdatedAt;
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