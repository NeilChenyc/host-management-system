package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.dto.AlertStatisticsDTO;
import java.util.List;

/**
 * Service interface for the alert system.
 * Provides core functionality for alert management and evaluation.
 */
public interface AlertSystemService {

    /**
     * Validate an alert rule to ensure it meets all requirements.
     *
     * @param rule the alert rule to validate
     * @return true if the rule is valid, false otherwise
     */
    boolean validateAlertRule(AlertRule rule);

    /**
     * Evaluate server metrics against all active alert rules.
     *
     * @param metrics the server metrics to evaluate
     * @return list of alert events triggered by the evaluation
     */
    List<AlertEvent> evaluateMetrics(ServerMetrics metrics);

    /**
     * Evaluate metrics for a specific server by serverId.
     * Automatically fetches the latest metrics from the repository.
     *
     * @param serverId the ID of the server to evaluate metrics for
     * @return list of alert events triggered by the evaluation
     */
    List<AlertEvent> evaluateMetrics(Long serverId);

    /**
     * Trigger an alert event manually.
     *
     * @param alertEvent the alert event to trigger
     * @return the created alert event
     */
    AlertEvent triggerAlert(AlertEvent alertEvent);

    /**
     * Get all active (firing) alert events.
     *
     * @return list of active alert events
     */
    List<AlertEvent> getActiveAlerts();

    /**
     * Get statistics about alerts.
     *
     * @return alert statistics DTO containing counts and trends
     */
    AlertStatisticsDTO getAlertStatistics();
}