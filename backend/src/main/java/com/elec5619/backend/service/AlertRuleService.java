package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertRule;
import java.util.List;
import java.util.Optional;

/**
 * Service interface for AlertRule entity.
 * Provides business logic operations for alert rules.
 */
public interface AlertRuleService {

    /**
     * Create a new alert rule.
     *
     * @param alertRule the alert rule to create
     * @return the created alert rule
     */
    AlertRule createAlertRule(AlertRule alertRule);

    /**
     * Get all alert rules.
     *
     * @return list of all alert rules
     */
    List<AlertRule> getAllAlertRules();

    /**
     * Get alert rule by ID.
     *
     * @param ruleId the ID of the alert rule to get
     * @return the alert rule if found, otherwise Optional.empty()
     */
    Optional<AlertRule> getAlertRuleById(Long ruleId);

    /**
     * Update an existing alert rule.
     *
     * @param ruleId the ID of the alert rule to update
     * @param alertRule the updated alert rule data
     * @return the updated alert rule
     */
    AlertRule updateAlertRule(Long ruleId, AlertRule alertRule);

    /**
     * Delete an alert rule by ID.
     *
     * @param ruleId the ID of the alert rule to delete
     */
    void deleteAlertRule(Long ruleId);

    /**
     * Get alert rules by enabled status.
     *
     * @param enabled the enabled status to filter by
     * @return list of alert rules with the specified enabled status
     */
    List<AlertRule> getAlertRulesByEnabled(Boolean enabled);

    /**
     * Get alert rules by severity.
     *
     * @param severity the severity to filter by
     * @return list of alert rules with the specified severity
     */
    List<AlertRule> getAlertRulesBySeverity(String severity);

    /**
     * Enable or disable an alert rule.
     *
     * @param ruleId the ID of the alert rule to enable/disable
     * @param enabled the new enabled status
     * @return the updated alert rule
     */
    AlertRule toggleAlertRuleStatus(Long ruleId, Boolean enabled);
    
    /**
     * Get alert rules by project ID.
     *
     * @param projectId the project ID to filter by
     * @return list of alert rules for the specified project
     */
    List<AlertRule> getAlertRulesByProjectId(Long projectId);
}