package com.elec5619.backend.service.impl;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.entity.Server;
import com.elec5619.backend.dto.AlertEventResponseDto;
import com.elec5619.backend.repository.AlertEventRepository;
import com.elec5619.backend.repository.ServerRepository;
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
    private final ServerRepository serverRepository;

    @Autowired
    public AlertEventServiceImpl(AlertEventRepository alertEventRepository, ServerRepository serverRepository) {
        this.alertEventRepository = alertEventRepository;
        this.serverRepository = serverRepository;
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
    public List<AlertEventResponseDto> getAllAlertEventsWithNames() {
        List<AlertEvent> events = alertEventRepository.findAll();
        return events.stream()
                .map(this::convertToResponseDto)
                .collect(java.util.stream.Collectors.toList());
    }

    private AlertEventResponseDto convertToResponseDto(AlertEvent event) {
        AlertEventResponseDto dto = new AlertEventResponseDto();
        dto.setEventId(event.getEventId());
        dto.setStatus(event.getStatus());
        dto.setStartedAt(event.getStartedAt());
        dto.setResolvedAt(event.getResolvedAt());
        dto.setTriggeredValue(event.getTriggeredValue());
        dto.setSummary(event.getSummary());
        dto.setCreatedAt(event.getCreatedAt());
        
        // Get server name
        if (event.getServerId() != null) {
            serverRepository.findById(event.getServerId())
                    .ifPresent(server -> dto.setServerName(server.getServerName()));
        }
        
        // Get rule name
        if (event.getAlertRule() != null) {
            dto.setRuleName(event.getAlertRule().getRuleName());
        }
        
        return dto;
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
