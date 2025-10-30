package com.elec5619.backend.service;

import com.elec5619.backend.entity.AlertEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Service for handling alert notifications.
 * Provides basic notification functionality including email, console logging, and alert deduplication.
 */
@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    // Simple in-memory deduplication to prevent alert storms
    private final ConcurrentMap<String, LocalDateTime> lastNotificationTime = new ConcurrentHashMap<>();
    private final long NOTIFICATION_COOLDOWN_MINUTES = 5; // 5 minutes cooldown between notifications for same alert

    /**
     * Send notification for a triggered alert event.
     * 
     * @param alertEvent the alert event to notify about
     */
    public void sendAlertNotification(AlertEvent alertEvent) {
        try {
            if (alertEvent == null) {
                return; // ignore null inputs gracefully
            }
            String alertKey = generateAlertKey(alertEvent);
            
            // Check if we should send notification (deduplication)
            if (shouldSendNotification(alertKey)) {
                // Send console notification (for development)
                sendConsoleNotification(alertEvent);
                
                // Send email notification (if configured)
                sendEmailNotification(alertEvent);
                
                // Update last notification time
                lastNotificationTime.put(alertKey, LocalDateTime.now());
                
                logger.info("Notification sent for alert: {} - {}", 
                          alertEvent.getAlertRule().getRuleName(), alertEvent.getSummary());
            } else {
                logger.debug("Skipping notification for alert {} due to cooldown period", alertKey);
            }
            
        } catch (Exception e) {
            logger.error("Error sending notification for alert {}: {}", 
                        alertEvent == null ? "null" : alertEvent.getEventId(), e.getMessage(), e);
        }
    }

    /**
     * Send notifications for multiple alert events.
     * 
     * @param alertEvents list of alert events to notify about
     */
    public void sendAlertNotifications(List<AlertEvent> alertEvents) {
        if (alertEvents == null || alertEvents.isEmpty()) {
            return;
        }
        
        logger.info("Sending notifications for {} alert events", alertEvents.size());
        
        for (AlertEvent alertEvent : alertEvents) {
            sendAlertNotification(alertEvent);
        }
    }

    /**
     * Send console notification (for development/testing).
     */
    private void sendConsoleNotification(AlertEvent alertEvent) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        System.out.println("\n" + "=".repeat(80));
        System.out.println("🚨 ALERT NOTIFICATION");
        System.out.println("=".repeat(80));
        System.out.println("Time: " + timestamp);
        System.out.println("Server ID: " + alertEvent.getServerId());
        System.out.println("Rule: " + alertEvent.getAlertRule().getRuleName());
        System.out.println("Severity: " + alertEvent.getAlertRule().getSeverity());
        System.out.println("Message: " + alertEvent.getSummary());
        System.out.println("Status: " + alertEvent.getStatus());
        System.out.println("=".repeat(80) + "\n");
        
        logger.warn("CONSOLE ALERT: {} - {} - {}", 
                  alertEvent.getAlertRule().getRuleName(),
                  alertEvent.getAlertRule().getSeverity(),
                  alertEvent.getSummary());
    }

    /**
     * Send email notification (placeholder for future implementation).
     */
    private void sendEmailNotification(AlertEvent alertEvent) {
        // TODO: Implement actual email sending using JavaMail or similar
        // For now, just log that email would be sent
        
        String emailContent = String.format(
            "Alert: %s\n" +
            "Severity: %s\n" +
            "Server ID: %d\n" +
            "Message: %s\n" +
            "Time: %s",
            alertEvent.getAlertRule().getRuleName(),
            alertEvent.getAlertRule().getSeverity(),
            alertEvent.getServerId(),
            alertEvent.getSummary(),
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        );
        
        logger.info("EMAIL NOTIFICATION (placeholder):\n{}", emailContent);
    }

    /**
     * Generate a unique key for alert deduplication.
     */
    private String generateAlertKey(AlertEvent alertEvent) {
        return String.format("%d_%d_%s", 
                           alertEvent.getServerId(),
                           alertEvent.getAlertRule().getRuleId(),
                           alertEvent.getAlertRule().getSeverity());
    }

    /**
     * Check if notification should be sent based on cooldown period.
     */
    private boolean shouldSendNotification(String alertKey) {
        LocalDateTime lastTime = lastNotificationTime.get(alertKey);
        if (lastTime == null) {
            return true; // First time notification
        }
        
        LocalDateTime now = LocalDateTime.now();
        long minutesSinceLastNotification = java.time.Duration.between(lastTime, now).toMinutes();
        
        return minutesSinceLastNotification >= NOTIFICATION_COOLDOWN_MINUTES;
    }

    /**
     * Clear notification history (useful for testing).
     */
    public void clearNotificationHistory() {
        lastNotificationTime.clear();
        logger.info("Notification history cleared");
    }

    /**
     * Get notification statistics.
     */
    public String getNotificationStats() {
        return String.format("Active notification keys: %d, Cooldown period: %d minutes", 
                           lastNotificationTime.size(), NOTIFICATION_COOLDOWN_MINUTES);
    }
}
