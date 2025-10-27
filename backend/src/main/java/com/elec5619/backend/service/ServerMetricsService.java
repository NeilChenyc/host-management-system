package com.elec5619.backend.service;

import com.elec5619.backend.entity.Server;
import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.repository.ServerMetricsRepository;
import com.elec5619.backend.repository.ServerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing server metrics.
 * Handles CRUD operations and business logic for server metrics.
 */
@Service
public class ServerMetricsService {

    @Autowired
    private ServerMetricsRepository serverMetricsRepository;

    @Autowired
    private ServerRepository serverRepository;

    /**
     * Save metrics for a server
     */
    public ServerMetrics saveMetrics(ServerMetrics metrics) {
        return serverMetricsRepository.save(metrics);
    }

    /**
     * Get the latest metrics for a server
     */
    public Optional<ServerMetrics> getLatestMetrics(Long serverId) {
        ServerMetrics metrics = serverMetricsRepository.findTopByServerIdOrderByCollectedAtDesc(serverId);
        return Optional.ofNullable(metrics);
    }

    /**
     * Get all metrics for a server with pagination
     */
    public List<ServerMetrics> getMetricsForServer(Long serverId, int limit, int offset) {
        return serverMetricsRepository.findMetricsByServerIdWithPagination(serverId, limit, offset);
    }

    /**
     * Get metrics for a server within a time range
     */
    public List<ServerMetrics> getMetricsForServer(Long serverId, LocalDateTime startTime, LocalDateTime endTime) {
        return serverMetricsRepository.findByServerIdAndCollectedAtBetweenOrderByCollectedAtDesc(
                serverId, startTime, endTime);
    }

    /**
     * Get metrics for all servers within a time range
     */
    public List<ServerMetrics> getAllMetrics(LocalDateTime startTime, LocalDateTime endTime) {
        return serverMetricsRepository.findByCollectedAtBetweenOrderByCollectedAtDesc(startTime, endTime);
    }

    /**
     * Generate fake metrics for a server
     */
    public ServerMetrics generateFakeMetrics(Long serverId) {
        ServerMetrics metrics = new ServerMetrics(serverId);
        
        // Generate realistic fake data
        metrics.setCpuUsage(generateCpuUsage());
        metrics.setMemoryUsage(generateMemoryUsage());
        metrics.setDiskUsage(generateDiskUsage());
        metrics.setNetworkIn(generateNetworkIn());
        metrics.setNetworkOut(generateNetworkOut());
        metrics.setLoadAvg(generateLoadAvg());
        metrics.setTemperature(generateTemperature());
        metrics.setCollectedAt(LocalDateTime.now());
        
        return metrics;
    }

    /**
     * Generate fake metrics for all servers
     */
    public void generateFakeMetricsForAllServers() {
        List<Server> servers = serverRepository.findAll();
        for (Server server : servers) {
            ServerMetrics metrics = generateFakeMetrics(server.getId());
            saveMetrics(metrics);
            
            // Update server's last update time
            server.setLastUpdate(LocalDateTime.now());
            serverRepository.save(server);
        }
    }

    /**
     * Clean up old metrics (older than specified days)
     */
    @Transactional
    public void cleanupOldMetrics(int daysToKeep) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusDays(daysToKeep);
        serverMetricsRepository.deleteByCollectedAtBefore(cutoffTime);
    }

    // Private helper methods for generating fake data

    private Double generateCpuUsage() {
        // CPU usage: 10-90% with some variation
        double value = 10 + Math.random() * 80;
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private Double generateMemoryUsage() {
        // Memory usage: 20-85% with some variation
        double value = 20 + Math.random() * 65;
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private Double generateDiskUsage() {
        // Disk usage: 30-95% (usually higher than CPU/Memory)
        double value = 30 + Math.random() * 65;
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private Double generateNetworkIn() {
        // Network in: 0-100 MB/s
        double value = Math.random() * 100;
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private Double generateNetworkOut() {
        // Network out: 0-100 MB/s
        double value = Math.random() * 100;
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private Double generateLoadAvg() {
        // Load average: 0.1-8.0 (typical range)
        double value = 0.1 + Math.random() * 7.9;
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private Double generateTemperature() {
        // Temperature: 30-80°C
        double value = 30 + Math.random() * 50;
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
