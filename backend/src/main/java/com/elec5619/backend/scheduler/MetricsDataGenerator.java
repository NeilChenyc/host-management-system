package com.elec5619.backend.scheduler;

import com.elec5619.backend.service.ServerMetricsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled task component for generating fake real-time metrics data.
 * This component runs periodically to generate and store fake metrics for all servers.
 */
@Component
public class MetricsDataGenerator {

    private static final Logger logger = LoggerFactory.getLogger(MetricsDataGenerator.class);

    @Autowired
    private ServerMetricsService serverMetricsService;

    /**
     * Generate fake metrics for all servers every 5 seconds.
     * This simulates real-time data collection from monitoring systems.
     */
    @Scheduled(initialDelay = 30000, fixedRate = 5000) // Start after 30 seconds, then every 5 seconds
    public void generateMetricsData() {
        try {
            logger.info("Starting scheduled metrics data generation...");
            serverMetricsService.generateFakeMetricsForAllServers();
            logger.info("Successfully generated metrics data for all servers");
        } catch (Exception e) {
            logger.error("Error generating metrics data: {}", e.getMessage(), e);
        }
    }

    /**
     * Clean up old metrics data every hour.
     * This prevents the database from growing too large with historical data.
     */
    @Scheduled(initialDelay = 60000, fixedRate = 3600000) // Start after 1 minute, then every hour
    public void cleanupOldMetrics() {
        try {
            logger.info("Starting scheduled cleanup of old metrics data...");
            serverMetricsService.cleanupOldMetrics(7); // Keep 7 days of data
            logger.info("Successfully cleaned up old metrics data");
        } catch (Exception e) {
            logger.error("Error cleaning up old metrics data: {}", e.getMessage(), e);
        }
    }

    /**
     * Generate initial metrics data on application startup.
     * This ensures there's some data available immediately after the application starts.
     */
    @Scheduled(initialDelay = 10000, fixedRate = Long.MAX_VALUE) // Run once after 10 seconds
    public void generateInitialMetrics() {
        try {
            logger.info("Generating initial metrics data on startup...");
            serverMetricsService.generateFakeMetricsForAllServers();
            logger.info("Successfully generated initial metrics data");
        } catch (Exception e) {
            logger.error("Error generating initial metrics data: {}", e.getMessage(), e);
        }
    }
}
