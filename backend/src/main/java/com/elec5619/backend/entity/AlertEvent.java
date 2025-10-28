package com.elec5619.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

/**
 * AlertEvent entity representing an alert event in the system.
 * Records each triggered and confirmed alert event.
 */
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "alert_event")
public class AlertEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @NotNull(message = "Rule ID is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id", nullable = false, foreignKey = @ForeignKey(ConstraintMode.CONSTRAINT))
    @JsonIgnore
    private AlertRule alertRule;

    @NotNull(message = "Server ID is required")
    @Column(name = "server_id", nullable = false)
    private Long serverId;

    @NotBlank(message = "Status is required")
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @NotNull(message = "Started at is required")
    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "triggered_value")
    private Double triggeredValue;

    @Column(name = "summary")
    private String summary;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Default constructor
    public AlertEvent() {}

    // Getters and Setters
    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public AlertRule getAlertRule() {
        return alertRule;
    }

    public void setAlertRule(AlertRule alertRule) {
        this.alertRule = alertRule;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}