package com.elec5619.backend.repository;

import com.elec5619.backend.entity.AlertEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AlertEventRepository extends JpaRepository<AlertEvent, Long> {

    List<AlertEvent> findByAlertRuleRuleId(Long ruleId);

    List<AlertEvent> findByServerId(Long serverId);

    List<AlertEvent> findByStatus(String status);

    List<AlertEvent> findByStartedAtBetween(LocalDateTime start, LocalDateTime end);

    // 非分页：多条件过滤
    @Query("""
        SELECT e FROM AlertEvent e
        WHERE (:ruleId IS NULL OR e.alertRule.ruleId = :ruleId)
          AND (:serverId IS NULL OR e.serverId = :serverId)
          AND (:status IS NULL OR e.status = :status)
          AND (:startTime IS NULL OR e.startedAt >= :startTime)
          AND (:endTime IS NULL OR e.startedAt <= :endTime)
        ORDER BY e.startedAt DESC
    """)
    List<AlertEvent> findByFilters(@Param("ruleId") Long ruleId,
                                   @Param("serverId") Long serverId,
                                   @Param("status") String status,
                                   @Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime);

    // 分页：多条件过滤
    @Query("""
        SELECT e FROM AlertEvent e
        WHERE (:ruleId IS NULL OR e.alertRule.ruleId = :ruleId)
          AND (:serverId IS NULL OR e.serverId = :serverId)
          AND (:status IS NULL OR e.status = :status)
          AND (:startTime IS NULL OR e.startedAt >= :startTime)
          AND (:endTime IS NULL OR e.startedAt <= :endTime)
    """)
    Page<AlertEvent> findByFilters(@Param("ruleId") Long ruleId,
                                   @Param("serverId") Long serverId,
                                   @Param("status") String status,
                                   @Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime,
                                   Pageable pageable);
}
