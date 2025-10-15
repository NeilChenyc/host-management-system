package com.elec5619.backend.service;

import com.elec5619.backend.entity.Server;
import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.repository.ServerMetricsRepository;
import com.elec5619.backend.repository.ServerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
     * Get all metrics for a server
     */
    public List<ServerMetrics> getMetricsForServer(Long serverId) {
        return serverMetricsRepository.findByServerIdOrderByCollectedAtDesc(serverId);
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
    public void cleanupOldMetrics(int daysToKeep) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusDays(daysToKeep);
        serverMetricsRepository.deleteByCollectedAtBefore(cutoffTime);
    }

    // Private helper methods for generating fake data

    private Double generateCpuUsage() {
        // CPU usage: 10-90% with some variation
        return 10 + Math.random() * 80;
    }

    private Double generateMemoryUsage() {
        // Memory usage: 20-85% with some variation
        return 20 + Math.random() * 65;
    }

    private Double generateDiskUsage() {
        // Disk usage: 30-95% (usually higher than CPU/Memory)
        return 30 + Math.random() * 65;
    }

    private Double generateNetworkIn() {
        // Network in: 0-1000 MB/s
        return Math.random() * 1000;
    }

    private Double generateNetworkOut() {
        // Network out: 0-800 MB/s (usually less than in)
        return Math.random() * 800;
    }

    private Double generateLoadAvg() {
        // Load average: 0.1-8.0 (typical range)
        return 0.1 + Math.random() * 7.9;
    }

    private Double generateTemperature() {
        // Temperature: 30-80°C
        return 30 + Math.random() * 50;
    }
}
