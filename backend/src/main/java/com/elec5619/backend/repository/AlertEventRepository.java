package com.elec5619.backend.repository;

import com.elec5619.backend.entity.AlertEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for AlertEvent entity.
 * Provides data access methods for alert event operations.
 */
@Repository
public interface AlertEventRepository extends JpaRepository<AlertEvent, Long> {

    /**
     * Find alert events by rule ID.
     *
     * @param ruleId the rule ID to search for
     * @return List of alert events triggered by the specified rule
     */
    List<AlertEvent> findByAlertRuleRuleId(Long ruleId);

    /**
     * Find alert events by server ID.
     *
     * @param serverId the server ID to search for
     * @return List of alert events occurring on the specified server
     */
    List<AlertEvent> findByServerId(Long serverId);

    /**
     * Find alert events by status.
     *
     * @param status the status to search for (e.g., "firing", "resolved")
     * @return List of alert events with the specified status
     */
    List<AlertEvent> findByStatus(String status);

    /**
     * Find alert events by start time range.
     *
     * @param startTime the start of the time range
     * @param endTime the end of the time range
     * @return List of alert events that started within the specified time range
     */
    List<AlertEvent> findByStartedAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Find unresolved alert events (status is "firing").
     *
     * @return List of unresolved alert events
     */
    List<AlertEvent> findByStatusOrderByStartedAtDesc(String status);

    /**
     * Find alert events by rule ID and status.
     *
     * @param ruleId the rule ID to search for
     * @param status the status to search for
     * @return List of alert events with the specified rule ID and status
     */
    List<AlertEvent> findByAlertRuleRuleIdAndStatus(Long ruleId, String status);

    /**
     * Find alert events by server ID and status.
     *
     * @param serverId the server ID to search for
     * @param status the status to search for
     * @return List of alert events with the specified server ID and status
     */
    List<AlertEvent> findByServerIdAndStatus(Long serverId, String status);

    /**
     * Count alert events by rule ID and status.
     *
     * @param ruleId the rule ID to count
     * @param status the status to count
     * @return Number of alert events with the specified rule ID and status
     */
    Long countByAlertRuleRuleIdAndStatus(Long ruleId, String status);

    /**
     * Find alert events with pagination and sorting.
     * This method is useful for implementing efficient querying in the UI.
     *
     * @param ruleId optional rule ID filter
     * @param serverId optional server ID filter
     * @param status optional status filter
     * @param startTime optional start time filter
     * @param endTime optional end time filter
     * @return List of alert events matching the filters
     */
    @Query("SELECT e FROM AlertEvent e WHERE " +
            "(:ruleId IS NULL OR e.alertRule.ruleId = :ruleId) AND " +
            "(:serverId IS NULL OR e.serverId = :serverId) AND " +
            "(:status IS NULL OR e.status = :status) AND " +
            "(:startTime IS NULL OR e.startedAt >= :startTime) AND " +
            "(:endTime IS NULL OR e.startedAt <= :endTime) " +
            "ORDER BY e.startedAt DESC")
    List<AlertEvent> findByFilters(@Param("ruleId") Long ruleId, 
                                  @Param("serverId") Long serverId, 
                                  @Param("status") String status, 
                                  @Param("startTime") LocalDateTime startTime, 
                                  @Param("endTime") LocalDateTime endTime);
}