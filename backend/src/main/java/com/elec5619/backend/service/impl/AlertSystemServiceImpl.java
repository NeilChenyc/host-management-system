package com.elec5619.backend.service.impl;

import com.elec5619.backend.dto.AlertStatisticsDTO;
import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.repository.ServerMetricsRepository;
import com.elec5619.backend.service.AlertEventService;
import com.elec5619.backend.service.AlertRuleService;
import com.elec5619.backend.service.AlertSystemService;
import com.elec5619.backend.service.NotificationService;
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
    private final NotificationService notificationService;

    private static final Logger logger = Logger.getLogger(AlertSystemServiceImpl.class.getName());

    @Autowired
    public AlertSystemServiceImpl(AlertRuleService alertRuleService, 
                                    AlertEventService alertEventService,
                                    ServerMetricsRepository serverMetricsRepository,
                                    NotificationService notificationService) {
        this.alertRuleService = alertRuleService;
        this.alertEventService = alertEventService;
        this.serverMetricsRepository = serverMetricsRepository;
        this.notificationService = notificationService;
    }

    @Override
    public boolean validateAlertRule(AlertRule rule) {
        if (rule == null) return false;
        List<String> validComparators = List.of(">=", ">", "<=", "<", "==", "!=");
        List<String> validSeverities = List.of("low", "medium", "high", "critical");
        return rule.getRuleName() != null && !rule.getRuleName().isEmpty()
                && rule.getTargetMetric() != null && !rule.getTargetMetric().isEmpty()
                && validComparators.contains(rule.getComparator())
                && rule.getThreshold() != null
                && rule.getDuration() != null && rule.getDuration() > 0
                && rule.getSeverity() != null
                && validSeverities.contains(rule.getSeverity().toLowerCase());
    }

    @Override
    public List<AlertEvent> evaluateMetrics(ServerMetrics metrics) {
        List<AlertEvent> triggeredAlerts = new ArrayList<>();
        try {
            List<AlertRule> activeRules = alertRuleService.getAlertRulesByEnabled(true);
            for (AlertRule rule : activeRules) {
                if (evaluateRuleAgainstMetrics(rule, metrics)) {
                    // ✅ 去重：同规则+同server，5分钟内已firing则跳过
                    if (hasRecentActiveEvent(rule.getRuleId(), metrics.getServerId(), 5)) {
                        logger.info("Skip duplicate firing within 5 minutes: rule=" + rule.getRuleName()
                                + ", server=" + metrics.getServerId());
                        continue;
                    }
                    AlertEvent alertEvent = createAlertEvent(rule, metrics);
                    triggeredAlerts.add(alertEventService.createAlertEvent(alertEvent));
                }
            }
        } catch (Exception e) {
            logger.severe("Error evaluating provided metrics: " + e.getMessage());
        }
        return triggeredAlerts;
    }

    @Override
    public List<AlertEvent> evaluateMetrics(Long serverId) {
        List<AlertEvent> triggered = new ArrayList<>();
        try {
            ServerMetrics latest = serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(serverId);
            if (latest == null) {
                logger.warning("No metrics found for server ID: " + serverId);
                return triggered;
            }
            long age = ChronoUnit.MINUTES.between(latest.getCollectedAt(), LocalDateTime.now());
            if (age > 5) logger.warning("Metrics may be stale (" + age + " minutes old)");

            List<AlertRule> rules = alertRuleService.getAlertRulesByServerId(serverId);
            for (AlertRule rule : rules) {
                if (Boolean.TRUE.equals(rule.getEnabled()) && evaluateRuleAgainstMetrics(rule, latest)) {
                    // ✅ 去重
                    if (hasRecentActiveEvent(rule.getRuleId(), serverId, 5)) {
                        logger.info("Skip duplicate firing within 5 minutes: rule=" + rule.getRuleName()
                                + ", server=" + serverId);
                        continue;
                    }
                    AlertEvent event = createAlertEvent(rule, latest);
                    triggered.add(alertEventService.createAlertEvent(event));
                }
            }
        } catch (Exception e) {
            logger.severe("Error evaluating metrics for server " + serverId + ": " + e.getMessage());
        }
        return triggered;
    }

    @Override
    public AlertEvent triggerAlert(AlertEvent alertEvent) {
        if (alertEvent.getAlertRule() == null || alertEvent.getServerId() == null) {
            throw new IllegalArgumentException("Missing required fields for alert event");
        }
        // ✅ 手动触发也做去重（可按需删除）
        Long ruleId = alertEvent.getAlertRule().getRuleId();
        Long serverId = alertEvent.getServerId();
        if (hasRecentActiveEvent(ruleId, serverId, 5)) {
            throw new IllegalArgumentException("Duplicate firing within 5 minutes for same rule & server");
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
        try {
            dto.setTotalRules(alertRuleService.getAllAlertRules().size());
            dto.setActiveRules(alertRuleService.getAlertRulesByEnabled(true).size());
            dto.setTotalEvents(alertEventService.getAllAlertEvents().size());
            dto.setActiveEvents(getActiveAlerts().size());
            dto.setResolvedEvents(alertEventService.getAlertEventsByStatus("resolved").size());
            LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
            dto.setRecentEvents(alertEventService.getAlertEventsByTimeRange(yesterday, LocalDateTime.now()).size());
        } catch (Exception e) {
            logger.severe("Error computing alert statistics: " + e.getMessage());
        }
        return dto;
    }

    // ======= 私有方法 =======

    private boolean evaluateRuleAgainstMetrics(AlertRule rule, ServerMetrics metrics) {
        Double metricValue = getMetricValue(rule.getTargetMetric(), metrics);
        if (metricValue == null) return false;
        return switch (rule.getComparator()) {
            case ">=" -> metricValue >= rule.getThreshold();
            case ">"  -> metricValue > rule.getThreshold();
            case "<=" -> metricValue <= rule.getThreshold();
            case "<"  -> metricValue < rule.getThreshold();
            case "==" -> metricValue.equals(rule.getThreshold());
            case "!=" -> !metricValue.equals(rule.getThreshold());
            default   -> false;
        };
    }

    private Double getMetricValue(String metricName, ServerMetrics metrics) {
        Double value = metrics.getMetricByName(metricName);
        return (value != null) ? value : 0.0;
    }

    private AlertEvent createAlertEvent(AlertRule rule, ServerMetrics metrics) {
        AlertEvent event = new AlertEvent();
        event.setAlertRule(rule);
        event.setServerId(metrics.getServerId());
        event.setStatus("firing");
        event.setStartedAt(LocalDateTime.now());
        event.setTriggeredValue(getMetricValue(rule.getTargetMetric(), metrics));
        event.setSummary(rule.getRuleName() + " triggered on server " + metrics.getServerId());
        return event;
    }

    // ✅ 去重：最近 windowMinutes 分钟内是否已有相同 ruleId + serverId 且处于 firing
    private boolean hasRecentActiveEvent(Long ruleId, Long serverId, int windowMinutes) {
        LocalDateTime now = LocalDateTime.now();
        var recent = alertEventService.getAlertEventsWithFilters(
                ruleId, serverId, "firing", now.minusMinutes(windowMinutes), now);
        return recent != null && !recent.isEmpty();
    }
}
