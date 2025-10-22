package com.elec5619.backend.service.impl;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.repository.AlertEventRepository;
import com.elec5619.backend.service.AlertEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AlertEventServiceImpl implements AlertEventService {

    private final AlertEventRepository alertEventRepository;

    @Autowired
    public AlertEventServiceImpl(AlertEventRepository alertEventRepository) {
        this.alertEventRepository = alertEventRepository;
    }

    @Override
    public AlertEvent createAlertEvent(AlertEvent alertEvent) {
        alertEvent.setEventId(null);
        if (alertEvent.getStartedAt() == null) {
            alertEvent.setStartedAt(LocalDateTime.now());
        }
        if (alertEvent.getAlertRule() != null) {
            AlertRule rule = alertEvent.getAlertRule();
            if (rule.getRuleId() == null) {
                throw new IllegalArgumentException("AlertRule must have an ID when creating an AlertEvent");
            }
        }
        return alertEventRepository.save(alertEvent);
    }

    @Override
    public List<AlertEvent> getAllAlertEvents() {
        return alertEventRepository.findAll();
    }

    @Override
    public Optional<AlertEvent> getAlertEventById(Long eventId) {
        return alertEventRepository.findById(eventId);
    }

    @Override
    public AlertEvent updateAlertEvent(Long eventId, AlertEvent alertEvent) {
        AlertEvent existingEvent = alertEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Alert event with ID " + eventId + " not found"));

        existingEvent.setServerId(alertEvent.getServerId());
        existingEvent.setStatus(alertEvent.getStatus());
        existingEvent.setStartedAt(alertEvent.getStartedAt());
        existingEvent.setResolvedAt(alertEvent.getResolvedAt());
        existingEvent.setTriggeredValue(alertEvent.getTriggeredValue());
        existingEvent.setSummary(alertEvent.getSummary());

        return alertEventRepository.save(existingEvent);
    }

    @Override
    public void deleteAlertEvent(Long eventId) {
        AlertEvent existingEvent = alertEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Alert event with ID " + eventId + " not found"));
        alertEventRepository.delete(existingEvent);
    }

    @Override
    public List<AlertEvent> getAlertEventsByRuleId(Long ruleId) {
        return alertEventRepository.findByAlertRuleRuleId(ruleId);
    }

    @Override
    public List<AlertEvent> getAlertEventsByServerId(Long serverId) {
        return alertEventRepository.findByServerId(serverId);
    }

    @Override
    public List<AlertEvent> getAlertEventsByStatus(String status) {
        return alertEventRepository.findByStatus(status);
    }

    @Override
    public List<AlertEvent> getAlertEventsByTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        return alertEventRepository.findByStartedAtBetween(startTime, endTime);
    }

    @Override
    public AlertEvent resolveAlertEvent(Long eventId) {
        AlertEvent existingEvent = alertEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Alert event with ID " + eventId + " not found"));
        existingEvent.setStatus("resolved");
        existingEvent.setResolvedAt(LocalDateTime.now());
        return alertEventRepository.save(existingEvent);
    }

    @Override
    public List<AlertEvent> getAlertEventsWithFilters(Long ruleId, Long serverId, String status,
                                                      LocalDateTime startTime, LocalDateTime endTime) {
        return alertEventRepository.findByFilters(ruleId, serverId, status, startTime, endTime);
    }

    // ✅ 新增：分页版本实现
    @Override
    public Page<AlertEvent> getAlertEventsWithFilters(Long ruleId, Long serverId, String status,
                                                      LocalDateTime startTime, LocalDateTime endTime,
                                                      Pageable pageable) {
        return alertEventRepository.findByFilters(ruleId, serverId, status, startTime, endTime, pageable);
    }
}
