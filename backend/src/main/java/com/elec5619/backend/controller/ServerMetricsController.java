package com.elec5619.backend.controller;

import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.service.ServerMetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for server metrics operations.
 * Provides endpoints for retrieving real-time and historical metrics data.
 */
@RestController
@RequestMapping("/api/servers")
@CrossOrigin(origins = "*")
public class ServerMetricsController {

    @Autowired
    private ServerMetricsService serverMetricsService;

    /**
     * Get the latest metrics for a specific server
     */
    @GetMapping("/{serverId}/metrics/latest")
    public ResponseEntity<ServerMetrics> getLatestMetrics(@PathVariable Long serverId) {
        Optional<ServerMetrics> metrics = serverMetricsService.getLatestMetrics(serverId);
        return metrics.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all metrics for a specific server
     */
    @GetMapping("/{serverId}/metrics")
    public ResponseEntity<List<ServerMetrics>> getServerMetrics(@PathVariable Long serverId) {
        List<ServerMetrics> metrics = serverMetricsService.getMetricsForServer(serverId);
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get metrics for a specific server within a time range
     */
    @GetMapping("/{serverId}/metrics/range")
    public ResponseEntity<List<ServerMetrics>> getServerMetricsInRange(
            @PathVariable Long serverId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        List<ServerMetrics> metrics = serverMetricsService.getMetricsForServer(serverId, startTime, endTime);
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get metrics for all servers within a time range
     */
    @GetMapping("/metrics/range")
    public ResponseEntity<List<ServerMetrics>> getAllMetricsInRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        List<ServerMetrics> metrics = serverMetricsService.getAllMetrics(startTime, endTime);
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get recent metrics for all servers (last hour)
     */
    @GetMapping("/metrics/recent")
    public ResponseEntity<List<ServerMetrics>> getRecentMetrics() {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        LocalDateTime now = LocalDateTime.now();
        
        List<ServerMetrics> metrics = serverMetricsService.getAllMetrics(oneHourAgo, now);
        return ResponseEntity.ok(metrics);
    }

    /**
     * Manually trigger metrics generation for all servers
     */
    @PostMapping("/metrics/generate")
    public ResponseEntity<String> generateMetrics() {
        try {
            serverMetricsService.generateFakeMetricsForAllServers();
            return ResponseEntity.ok("Metrics generated successfully for all servers");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error generating metrics: " + e.getMessage());
        }
    }

    /**
     * Get metrics summary for a specific server (last 24 hours)
     */
    @GetMapping("/{serverId}/metrics/summary")
    public ResponseEntity<Object> getMetricsSummary(@PathVariable Long serverId) {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        LocalDateTime now = LocalDateTime.now();
        
        List<ServerMetrics> metrics = serverMetricsService.getMetricsForServer(serverId, twentyFourHoursAgo, now);
        
        if (metrics.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Calculate summary statistics
        double avgCpu = metrics.stream().mapToDouble(m -> m.getCpuUsage() != null ? m.getCpuUsage() : 0).average().orElse(0);
        double avgMemory = metrics.stream().mapToDouble(m -> m.getMemoryUsage() != null ? m.getMemoryUsage() : 0).average().orElse(0);
        double avgDisk = metrics.stream().mapToDouble(m -> m.getDiskUsage() != null ? m.getDiskUsage() : 0).average().orElse(0);
        double avgTemperature = metrics.stream().mapToDouble(m -> m.getTemperature() != null ? m.getTemperature() : 0).average().orElse(0);
        
        double maxCpu = metrics.stream().mapToDouble(m -> m.getCpuUsage() != null ? m.getCpuUsage() : 0).max().orElse(0);
        double maxMemory = metrics.stream().mapToDouble(m -> m.getMemoryUsage() != null ? m.getMemoryUsage() : 0).max().orElse(0);
        double maxDisk = metrics.stream().mapToDouble(m -> m.getDiskUsage() != null ? m.getDiskUsage() : 0).max().orElse(0);
        double maxTemperature = metrics.stream().mapToDouble(m -> m.getTemperature() != null ? m.getTemperature() : 0).max().orElse(0);
        
        final Long sid = serverId;
        final int dataPointCount = metrics.size();
        return ResponseEntity.ok(new Object() {
            public final Long id = sid;
            public final int dataPoints = dataPointCount;
            public final String timeRange = "Last 24 hours";
            public final Object averages = new Object() {
                public final double cpu = Math.round(avgCpu * 100.0) / 100.0;
                public final double memory = Math.round(avgMemory * 100.0) / 100.0;
                public final double disk = Math.round(avgDisk * 100.0) / 100.0;
                public final double temperature = Math.round(avgTemperature * 100.0) / 100.0;
            };
            public final Object maximums = new Object() {
                public final double cpu = Math.round(maxCpu * 100.0) / 100.0;
                public final double memory = Math.round(maxMemory * 100.0) / 100.0;
                public final double disk = Math.round(maxDisk * 100.0) / 100.0;
                public final double temperature = Math.round(maxTemperature * 100.0) / 100.0;
            };
        });
    }
}
