package com.elec5619.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.elec5619.backend.entity.AlertEvent;

/**
 * Service interface for AlertEvent entity.
 * Provides business logic operations for alert events.
 */
public interface AlertEventService {

    /**
     * Create a new alert event.
     *
     * @param alertEvent the alert event to create
     * @return the created alert event
     */
    AlertEvent createAlertEvent(AlertEvent alertEvent);

    /**
     * Get all alert events.
     *
     * @return list of all alert events
     */
    List<AlertEvent> getAllAlertEvents();

    /**
     * Get alert event by ID.
     *
     * @param eventId the ID of the alert event to get
     * @return the alert event if found, otherwise Optional.empty()
     */
    Optional<AlertEvent> getAlertEventById(Long eventId);

    /**
     * Update an existing alert event.
     *
     * @param eventId the ID of the alert event to update
     * @param alertEvent the updated alert event data
     * @return the updated alert event
     */
    AlertEvent updateAlertEvent(Long eventId, AlertEvent alertEvent);

    /**
     * Delete an alert event by ID.
     *
     * @param eventId the ID of the alert event to delete
     */
    void deleteAlertEvent(Long eventId);

    /**
     * Get alert events by rule ID.
     *
     * @param ruleId the ID of the rule to filter by
     * @return list of alert events triggered by the specified rule
     */
    List<AlertEvent> getAlertEventsByRuleId(Long ruleId);

    /**
     * Get alert events by server ID.
     *
     * @param serverId the ID of the server to filter by
     * @return list of alert events occurring on the specified server
     */
    List<AlertEvent> getAlertEventsByServerId(Long serverId);

    /**
     * Get alert events by status.
     *
     * @param status the status to filter by (e.g., "firing", "resolved")
     * @return list of alert events with the specified status
     */
    List<AlertEvent> getAlertEventsByStatus(String status);

    /**
     * Get alert events by time range.
     *
     * @param startTime the start of the time range
     * @param endTime the end of the time range
     * @return list of alert events that started within the specified time range
     */
    List<AlertEvent> getAlertEventsByTimeRange(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Mark an alert event as resolved.
     *
     * @param eventId the ID of the alert event to resolve
     * @return the resolved alert event
     */
    AlertEvent resolveAlertEvent(Long eventId);

    /**
     * Get alert events with filters.
     *
     * @param ruleId optional rule ID filter
     * @param serverId optional server ID filter
     * @param status optional status filter
     * @param startTime optional start time filter
     * @param endTime optional end time filter
     * @return list of alert events matching the filters
     */
    List<AlertEvent> getAlertEventsWithFilters(Long ruleId, Long serverId, String status, LocalDateTime startTime, LocalDateTime endTime);
}