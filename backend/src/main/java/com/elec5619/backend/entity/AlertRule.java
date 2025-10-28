package com.elec5619.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * AlertRule entity representing an alert rule in the system.
 * Defines conditions for triggering alerts.
 */
@Entity
@Table(name = "alert_rule")
public class AlertRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private Long ruleId;

    @NotBlank(message = "Rule name is required")
    @Column(name = "rule_name", nullable = false, length = 255)
    private String ruleName;

    @Column(name = "description")
    private String description;

    @NotBlank(message = "Target metric is required")
    @Column(name = "target_metric", nullable = false, length = 100)
    private String targetMetric;

    @NotBlank(message = "Comparator is required")
    @Column(name = "comparator", nullable = false, length = 20)
    private String comparator;

    @NotNull(message = "Threshold is required")
    @Column(name = "threshold", nullable = false)
    private Double threshold;

    @NotNull(message = "Duration is required")
    @Column(name = "duration", nullable = false)
    private Integer duration;

    @NotBlank(message = "Severity is required")
    @Column(name = "severity", nullable = false, length = 50)
    private String severity;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "scope_level", length = 50)
    private String scopeLevel;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "target_filter")
    private String targetFilter;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Default constructor
    public AlertRule() {}

    // Getters and Setters
    public Long getRuleId() {
        return ruleId;
    }

    public void setRuleId(Long ruleId) {
        this.ruleId = ruleId;
    }

    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getTargetFilter() {
        return targetFilter;
    }

    public void setTargetFilter(String targetFilter) {
        this.targetFilter = targetFilter;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}