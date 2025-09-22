package com.elec5619.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * ServerMetrics entity representing metrics collected from a server.
 * Stores various performance metrics like CPU usage, memory usage, etc.
 */
@Entity
@Table(name = "server_metrics")
public class ServerMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "metric_id")
    private Long metricId;

    @NotNull(message = "Server ID is required")
    @Column(name = "server_id", nullable = false)
    private Long serverId;

    @Column(name = "cpu_usage")
    private Double cpuUsage;

    @Column(name = "memory_usage")
    private Double memoryUsage;

    @Column(name = "disk_usage")
    private Double diskUsage;

    @Column(name = "network_in")
    private Double networkIn;

    @Column(name = "network_out")
    private Double networkOut;

    @Column(name = "load_avg")
    private Double loadAvg;

    @Column(name = "temperature")
    private Double temperature;

    @CreationTimestamp
    @Column(name = "collected_at", nullable = false)
    private LocalDateTime collectedAt;

    // Default constructor
    public ServerMetrics() {
    }

    // Parameterized constructor
    public ServerMetrics(Long serverId) {
        this.serverId = serverId;
    }

    // Getters and Setters
    public Long getMetricId() {
        return metricId;
    }

    public void setMetricId(Long metricId) {
        this.metricId = metricId;
    }

    public Long getServerId() {
        return serverId;
    }

    public void setServerId(Long serverId) {
        this.serverId = serverId;
    }

    public Double getCpuUsage() {
        return cpuUsage;
    }

    public void setCpuUsage(Double cpuUsage) {
        this.cpuUsage = cpuUsage;
    }

    public Double getMemoryUsage() {
        return memoryUsage;
    }

    public void setMemoryUsage(Double memoryUsage) {
        this.memoryUsage = memoryUsage;
    }

    public Double getDiskUsage() {
        return diskUsage;
    }

    public void setDiskUsage(Double diskUsage) {
        this.diskUsage = diskUsage;
    }

    public Double getNetworkIn() {
        return networkIn;
    }

    public void setNetworkIn(Double networkIn) {
        this.networkIn = networkIn;
    }

    public Double getNetworkOut() {
        return networkOut;
    }

    public void setNetworkOut(Double networkOut) {
        this.networkOut = networkOut;
    }

    public Double getLoadAvg() {
        return loadAvg;
    }

    public void setLoadAvg(Double loadAvg) {
        this.loadAvg = loadAvg;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public LocalDateTime getCollectedAt() {
        return collectedAt;
    }

    public void setCollectedAt(LocalDateTime collectedAt) {
        this.collectedAt = collectedAt;
    }

    /**
     * Get all metrics as a map for easy access
     */
    public Map<String, Double> getAllMetrics() {
        Map<String, Double> metricsMap = new HashMap<>();
        if (cpuUsage != null) metricsMap.put("cpu_usage", cpuUsage);
        if (memoryUsage != null) metricsMap.put("memory_usage", memoryUsage);
        if (diskUsage != null) metricsMap.put("disk_usage", diskUsage);
        if (networkIn != null) metricsMap.put("network_in", networkIn);
        if (networkOut != null) metricsMap.put("network_out", networkOut);
        if (loadAvg != null) metricsMap.put("load_avg", loadAvg);
        if (temperature != null) metricsMap.put("temperature", temperature);
        return metricsMap;
    }

    /**
     * Get a specific metric value by name
     */
    public Double getMetricByName(String metricName) {
        switch (metricName) {
            case "cpu_usage":
                return cpuUsage;
            case "memory_usage":
                return memoryUsage;
            case "disk_usage":
                return diskUsage;
            case "network_in":
                return networkIn;
            case "network_out":
                return networkOut;
            case "load_avg":
                return loadAvg;
            case "temperature":
                return temperature;
            default:
                return null;
        }
    }
}