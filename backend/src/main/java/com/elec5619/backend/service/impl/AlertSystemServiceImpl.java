package com.elec5619.backend.service.impl;

import com.elec5619.backend.dto.AlertStatisticsDTO;
import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.repository.ServerMetricsRepository;
import com.elec5619.backend.service.AlertEventService;
import com.elec5619.backend.service.AlertRuleService;
import com.elec5619.backend.service.AlertSystemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@Service
public class AlertSystemServiceImpl implements AlertSystemService {

    private final AlertRuleService alertRuleService;
    private final AlertEventService alertEventService;
    private final ServerMetricsRepository serverMetricsRepository;

    private static final Logger logger = Logger.getLogger(AlertSystemServiceImpl.class.getName());

    @Autowired
    public AlertSystemServiceImpl(AlertRuleService alertRuleService,
                                   AlertEventService alertEventService,
                                   ServerMetricsRepository serverMetricsRepository) {
        this.alertRuleService = alertRuleService;
        this.alertEventService = alertEventService;
        this.serverMetricsRepository = serverMetricsRepository;
    }

    @Override
    public boolean validateAlertRule(AlertRule rule) {
        if (rule == null || rule.getRuleName() == null || rule.getTargetMetric() == null ||
                rule.getComparator() == null || rule.getThreshold() == null || rule.getDuration() == null ||
                rule.getSeverity() == null) {
            return false;
        }
        List<String> validComparators = List.of(">=", ">", "<=", "<", "==", "!=");
        return validComparators.contains(rule.getComparator());
    }

    @Override
    public List<AlertEvent> evaluateMetrics(ServerMetrics metrics) {
        List<AlertRule> activeRules = alertRuleService.getAlertRulesByEnabled(true);
        List<AlertEvent> triggeredAlerts = new ArrayList<>();
        for (AlertRule rule : activeRules) {
            if (evaluateRuleAgainstMetrics(rule, metrics)) {
                AlertEvent alertEvent = createAlertEvent(rule, metrics);
                triggeredAlerts.add(alertEventService.createAlertEvent(alertEvent));
            }
        }
        return triggeredAlerts;
    }

    @Override
    public List<AlertEvent> evaluateMetrics(Long serverId) {
        ServerMetrics latestMetrics = serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(serverId);
        if (latestMetrics == null) return new ArrayList<>();

        long minutesDifference = ChronoUnit.MINUTES.between(latestMetrics.getCollectedAt(), LocalDateTime.now());
        if (minutesDifference > 5) {
            logger.warning("Metrics are stale: " + minutesDifference + " minutes old.");
        }

        List<AlertRule> projectRules = alertRuleService.getAlertRulesByProjectId(serverId);
        List<AlertEvent> triggeredEvents = new ArrayList<>();
        for (AlertRule rule : projectRules) {
            if (Boolean.TRUE.equals(rule.getEnabled()) && evaluateRuleAgainstMetrics(rule, latestMetrics)) {
                AlertEvent alertEvent = createAlertEvent(rule, latestMetrics);
                triggeredEvents.add(alertEventService.createAlertEvent(alertEvent));
            }
        }
        return triggeredEvents;
    }

    @Override
    public AlertEvent triggerAlert(AlertEvent alertEvent) {
        if (alertEvent.getAlertRule() == null || alertEvent.getServerId() == null) {
            throw new IllegalArgumentException("Missing required fields for alert event");
        }
        return alertEventService.createAlertEvent(alertEvent);
    }

    @Override
    public List<AlertEvent> getActiveAlerts() {
        return alertEventService.getAlertEventsByStatus("firing");
    }

    @Override
    public AlertStatisticsDTO getAlertStatistics() {
        AlertStatisticsDTO dto = new AlertStatisticsDTO();
        dto.setTotalRules(alertRuleService.getAllAlertRules().size());
        dto.setActiveRules(alertRuleService.getAlertRulesByEnabled(true).size());
        dto.setTotalEvents(alertEventService.getAllAlertEvents().size());
        dto.setActiveEvents(getActiveAlerts().size());
        dto.setResolvedEvents(alertEventService.getAlertEventsByStatus("resolved").size());

        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        dto.setRecentEvents(alertEventService.getAlertEventsByTimeRange(yesterday, LocalDateTime.now()).size());
        return dto;
    }

    private boolean evaluateRuleAgainstMetrics(AlertRule rule, ServerMetrics metrics) {
        Double metricValue = metrics.getMetricByName(rule.getTargetMetric());
        if (metricValue == null) return false;

        return switch (rule.getComparator()) {
            case ">=" -> metricValue >= rule.getThreshold();
            case ">" -> metricValue > rule.getThreshold();
            case "<=" -> metricValue <= rule.getThreshold();
            case "<" -> metricValue < rule.getThreshold();
            case "==" -> metricValue.equals(rule.getThreshold());
            case "!=" -> !metricValue.equals(rule.getThreshold());
            default -> false;
        };
    }

    private AlertEvent createAlertEvent(AlertRule rule, ServerMetrics metrics) {
        AlertEvent event = new AlertEvent();
        event.setAlertRule(rule);
        event.setServerId(metrics.getServerId());
        event.setStatus("firing");
        event.setStartedAt(LocalDateTime.now());
        event.setTriggeredValue(metrics.getMetricByName(rule.getTargetMetric()));
        event.setSummary(rule.getRuleName() + " triggered on server " + metrics.getServerId());
        return event;
    }
}
