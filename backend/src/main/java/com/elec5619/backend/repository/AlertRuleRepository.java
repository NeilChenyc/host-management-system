package com.elec5619.backend.repository;

import com.elec5619.backend.entity.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for AlertRule entity.
 * Provides data access methods for alert rule operations.
 */
@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRule, Long> {

    /**
     * Find alert rules by their enabled status.
     *
     * @param enabled the enabled status to search for
     * @return List of alert rules with the specified enabled status
     */
    List<AlertRule> findByEnabled(Boolean enabled);

    /**
     * Find alert rules by project ID.
     *
     * @param projectId the project ID to search for
     * @return List of alert rules for the specified project
     */
    List<AlertRule> findByProjectId(Long projectId);

    /**
     * Find alert rules by severity.
     *
     * @param severity the severity level to search for
     * @return List of alert rules with the specified severity
     */
    List<AlertRule> findBySeverity(String severity);

    /**
     * Find alert rules by target metric.
     *
     * @param targetMetric the target metric to search for
     * @return List of alert rules with the specified target metric
     */
    List<AlertRule> findByTargetMetric(String targetMetric);

    /**
     * Find alert rules by scope level.
     *
     * @param scopeLevel the scope level to search for
     * @return List of alert rules with the specified scope level
     */
    List<AlertRule> findByScopeLevel(String scopeLevel);

    /**
     * Check if an alert rule exists by rule name.
     *
     * @param ruleName the rule name to check
     * @return true if rule exists, false otherwise
     */
    boolean existsByRuleName(String ruleName);

    /**
     * Find an alert rule by rule name.
     *
     * @param ruleName the rule name to search for
     * @return Optional containing the alert rule if found
     */
    Optional<AlertRule> findByRuleName(String ruleName);

    /**
     * Delete all alert rules by project ID.
     *
     * @param projectId the project ID to delete alert rules for
     */
    void deleteByProjectId(Long projectId);
}