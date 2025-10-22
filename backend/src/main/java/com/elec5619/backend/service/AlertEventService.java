package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service interface for AlertEvent entity.
 * Provides business logic operations for alert events.
 */
public interface AlertEventService {

    AlertEvent createAlertEvent(AlertEvent alertEvent);

    List<AlertEvent> getAllAlertEvents();

    Optional<AlertEvent> getAlertEventById(Long eventId);

    AlertEvent updateAlertEvent(Long eventId, AlertEvent alertEvent);

    void deleteAlertEvent(Long eventId);

    List<AlertEvent> getAlertEventsByRuleId(Long ruleId);

    List<AlertEvent> getAlertEventsByServerId(Long serverId);

    List<AlertEvent> getAlertEventsByStatus(String status);

    List<AlertEvent> getAlertEventsByTimeRange(LocalDateTime startTime, LocalDateTime endTime);

    AlertEvent resolveAlertEvent(Long eventId);

    List<AlertEvent> getAlertEventsWithFilters(Long ruleId, Long serverId, String status,
                                               LocalDateTime startTime, LocalDateTime endTime);

    // ✅ 新增：分页版本
    Page<AlertEvent> getAlertEventsWithFilters(Long ruleId, Long serverId, String status,
                                               LocalDateTime startTime, LocalDateTime endTime,
                                               Pageable pageable);
}
