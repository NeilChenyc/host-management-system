package com.elec5619.backend.config;

import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.service.AlertRuleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Component to initialize sample alert rules on application startup.
 * This provides some default alert rules for testing the monitoring system.
 */
@Component
public class AlertRuleInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AlertRuleInitializer.class);

    @Autowired
    private AlertRuleService alertRuleService;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing sample alert rules...");
        
        // Check if alert rules already exist
        if (!alertRuleService.getAllAlertRules().isEmpty()) {
            logger.info("Alert rules already exist, skipping initialization");
            return;
        }

        try {
            // Create sample alert rules for testing
            createSampleAlertRules();
            logger.info("Successfully initialized sample alert rules");
        } catch (Exception e) {
            logger.error("Error initializing alert rules: {}", e.getMessage(), e);
        }
    }

    private void createSampleAlertRules() {
        // High CPU Usage Alert
        AlertRule cpuAlert = new AlertRule();
        cpuAlert.setRuleName("High CPU Usage");
        cpuAlert.setDescription("Alert when CPU usage exceeds 80%");
        cpuAlert.setTargetMetric("cpu_usage");
        cpuAlert.setComparator(">=");
        cpuAlert.setThreshold(80.0);
        cpuAlert.setDuration(60); // 1 minute
        cpuAlert.setSeverity("high");
        cpuAlert.setEnabled(true);
        cpuAlert.setScopeLevel("SERVER");
        cpuAlert.setServerId(1L);
        alertRuleService.createAlertRule(cpuAlert);

        // Critical CPU Usage Alert
        AlertRule criticalCpuAlert = new AlertRule();
        criticalCpuAlert.setRuleName("Critical CPU Usage");
        criticalCpuAlert.setDescription("Alert when CPU usage exceeds 95%");
        criticalCpuAlert.setTargetMetric("cpu_usage");
        criticalCpuAlert.setComparator(">=");
        criticalCpuAlert.setThreshold(95.0);
        criticalCpuAlert.setDuration(30); // 30 seconds
        criticalCpuAlert.setSeverity("critical");
        criticalCpuAlert.setEnabled(true);
        criticalCpuAlert.setScopeLevel("SERVER");
        criticalCpuAlert.setServerId(1L);
        alertRuleService.createAlertRule(criticalCpuAlert);

        // High Memory Usage Alert
        AlertRule memoryAlert = new AlertRule();
        memoryAlert.setRuleName("High Memory Usage");
        memoryAlert.setDescription("Alert when memory usage exceeds 85%");
        memoryAlert.setTargetMetric("memory_usage");
        memoryAlert.setComparator(">=");
        memoryAlert.setThreshold(85.0);
        memoryAlert.setDuration(120); // 2 minutes
        memoryAlert.setSeverity("high");
        memoryAlert.setEnabled(true);
        memoryAlert.setScopeLevel("SERVER");
        memoryAlert.setServerId(1L);
        alertRuleService.createAlertRule(memoryAlert);

        // High Disk Usage Alert
        AlertRule diskAlert = new AlertRule();
        diskAlert.setRuleName("High Disk Usage");
        diskAlert.setDescription("Alert when disk usage exceeds 90%");
        diskAlert.setTargetMetric("disk_usage");
        diskAlert.setComparator(">=");
        diskAlert.setThreshold(90.0);
        diskAlert.setDuration(300); // 5 minutes
        diskAlert.setSeverity("critical");
        diskAlert.setEnabled(true);
        diskAlert.setScopeLevel("SERVER");
        diskAlert.setServerId(1L);
        alertRuleService.createAlertRule(diskAlert);

        // High Temperature Alert
        AlertRule temperatureAlert = new AlertRule();
        temperatureAlert.setRuleName("High Temperature");
        temperatureAlert.setDescription("Alert when temperature exceeds 80°C");
        temperatureAlert.setTargetMetric("temperature");
        temperatureAlert.setComparator(">=");
        temperatureAlert.setThreshold(80.0);
        temperatureAlert.setDuration(180); // 3 minutes
        temperatureAlert.setSeverity("high");
        temperatureAlert.setEnabled(true);
        temperatureAlert.setScopeLevel("SERVER");
        temperatureAlert.setServerId(1L);
        alertRuleService.createAlertRule(temperatureAlert);

        logger.info("Created 5 sample alert rules for testing");
    }
}
