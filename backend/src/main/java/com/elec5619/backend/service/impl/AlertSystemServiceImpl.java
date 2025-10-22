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
        logger.info("Evaluating provided metrics against all active alert rules");
        try {
            // Get all active alert rules
            List<AlertRule> activeRules = alertRuleService.getAlertRulesByEnabled(true);
            List<AlertEvent> triggeredAlerts = new ArrayList<>();
            
            logger.info("Evaluating " + activeRules.size() + " active alert rules");
            
            for (AlertRule rule : activeRules) {
                if (evaluateRuleAgainstMetrics(rule, metrics)) {
                    AlertEvent alertEvent = createAlertEvent(rule, metrics);
                    AlertEvent createdEvent = alertEventService.createAlertEvent(alertEvent);
                    triggeredAlerts.add(createdEvent);
                    logger.info("Rule triggered: " + rule.getRuleName());
                }
            }
            
            logger.info("Metric evaluation completed. Triggered " + triggeredAlerts.size() + " alerts");
            
            // Send notifications for triggered alerts
            if (!triggeredAlerts.isEmpty()) {
                notificationService.sendAlertNotifications(triggeredAlerts);
            }
            
            return triggeredAlerts;
        } catch (Exception e) {
            logger.severe("Error evaluating provided metrics: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<AlertEvent> evaluateMetrics(Long serverId) {
        logger.info("Evaluating metrics for server ID: " + serverId);
        try {
            // Fetch the latest metrics for the server from the repository
            ServerMetrics latestMetrics = serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(serverId);
            
            if (latestMetrics == null) {
                logger.warning("No metrics found for server ID: " + serverId);
                return new ArrayList<>();
            }
            
            // Check if metrics are recent (within the last 5 minutes)
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime collectedTime = latestMetrics.getCollectedAt();
            long minutesDifference = ChronoUnit.MINUTES.between(collectedTime, now);
            
            if (minutesDifference > 5) {
                logger.warning("Metrics for server ID: " + serverId + " are stale (" + minutesDifference + " minutes old)");
            }
            
            // Get all enabled alert rules for the project (using serverId as projectId)
            List<AlertRule> projectRules = alertRuleService.getAlertRulesByProjectId(serverId);
            List<AlertRule> enabledRules = alertRuleService.getAlertRulesByEnabled(true);
            
            // Find the intersection of project rules and enabled rules
            List<AlertRule> rules = new ArrayList<>();
            for (AlertRule rule : projectRules) {
                if (enabledRules.contains(rule)) {
                    rules.add(rule);
                }
            }
            
            List<AlertEvent> triggeredEvents = new ArrayList<>();
            
            logger.info("Evaluating " + rules.size() + " alert rules for server ID: " + serverId);
            
            // Evaluate each rule against the metrics
            for (AlertRule rule : rules) {
                if (evaluateRuleAgainstMetrics(rule, latestMetrics)) {
                    // Create a new alert event if the rule is triggered
                    AlertEvent alertEvent = createAlertEvent(rule, latestMetrics);
                    AlertEvent createdEvent = alertEventService.createAlertEvent(alertEvent);
                    triggeredEvents.add(createdEvent);
                    logger.info("Rule triggered: " + rule.getRuleName() + " for server ID: " + serverId);
                }
            }
            
            logger.info("Metric evaluation completed. Triggered " + triggeredEvents.size() + " alerts for server ID: " + serverId);
            
            // Send notifications for triggered alerts
            if (!triggeredEvents.isEmpty()) {
                notificationService.sendAlertNotifications(triggeredEvents);
            }
            
            return triggeredEvents;
        } catch (Exception e) {
            logger.severe("Error evaluating metrics for server ID: " + serverId + ": " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
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
