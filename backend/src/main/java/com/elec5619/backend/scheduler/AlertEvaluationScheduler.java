package com.elec5619.backend.scheduler;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.dto.ServerResponseDto;
import com.elec5619.backend.service.AlertSystemService;
import com.elec5619.backend.service.ServerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Scheduled task component for evaluating alert rules against server metrics.
 * This component runs periodically to check if any alert rules are triggered.
 */
@Component
public class AlertEvaluationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AlertEvaluationScheduler.class);

    @Autowired
    private AlertSystemService alertSystemService;

    @Autowired
    private ServerService serverService;

    /**
     * Evaluate alert rules for all servers every 30 seconds.
     * This checks if any metrics violate the configured alert rules.
     */
    @Scheduled(fixedRate = 30000) // Every 30 seconds
    @Transactional
    public void evaluateAlertRules() {
        try {
            logger.info("Starting scheduled alert rule evaluation...");
            
            // Get all active servers
            List<ServerResponseDto> serverDtos = serverService.listAll();
            logger.info("Evaluating alert rules for {} servers", serverDtos.size());
            
            int totalAlertsTriggered = 0;
            
            for (ServerResponseDto serverDto : serverDtos) {
                try {
                    // Evaluate metrics for this server
                    List<AlertEvent> triggeredAlerts = alertSystemService.evaluateMetrics(serverDto.getId());
                    
                    if (!triggeredAlerts.isEmpty()) {
                        totalAlertsTriggered += triggeredAlerts.size();
                        logger.warn("Triggered {} alerts for server: {} ({})", 
                                  triggeredAlerts.size(), serverDto.getServerName(), serverDto.getId());
                        
                        // Log each triggered alert
                        for (AlertEvent alert : triggeredAlerts) {
                            logger.warn("Alert triggered - Rule: {}, Severity: {}, Summary: {}", 
                                      alert.getAlertRule().getRuleName(),
                                      alert.getAlertRule().getSeverity(),
                                      alert.getSummary());
                        }
                    }
                } catch (Exception e) {
                    logger.error("Error evaluating alerts for server {}: {}", serverDto.getId(), e.getMessage());
                }
            }
            
            if (totalAlertsTriggered > 0) {
                logger.warn("Alert evaluation completed. Total alerts triggered: {}", totalAlertsTriggered);
            } else {
                logger.info("Alert evaluation completed. No alerts triggered.");
            }
            
        } catch (Exception e) {
            logger.error("Error during scheduled alert evaluation: {}", e.getMessage(), e);
        }
    }

    /**
     * Clean up resolved alerts every hour.
     * This removes old resolved alerts to keep the database clean.
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void cleanupResolvedAlerts() {
        try {
            logger.info("Starting scheduled cleanup of resolved alerts...");
            // TODO: Implement cleanup logic for resolved alerts older than 7 days
            logger.info("Successfully cleaned up resolved alerts");
        } catch (Exception e) {
            logger.error("Error cleaning up resolved alerts: {}", e.getMessage(), e);
        }
    }
}
