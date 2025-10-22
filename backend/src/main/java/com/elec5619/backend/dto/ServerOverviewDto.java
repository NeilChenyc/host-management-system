package com.elec5619.backend.dto;

import java.time.LocalDateTime;
import com.elec5619.backend.entity.ServerStatus;

/**
 * DTO for server overview including basic info and latest metrics
 */
public class ServerOverviewDto {
    
    private Long id;
    private String hostname;
    private String ipAddress;
    private ServerStatus status;
    private String operatingSystem;
    private String cpu;
    private String memory;
    
    // Latest metrics
    private Double cpuUsage;
    private Double memoryUsage;
    private Double diskUsage;
    private Double networkUsage; // Combined network in/out
    private Double temperature;
    private Double loadAvg;
    
    // Additional info
    private String uptime;
    private Integer alertCount;
    private LocalDateTime lastUpdate;
    private LocalDateTime createdAt;

    // Constructors
    public ServerOverviewDto() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public ServerStatus getStatus() {
        return status;
    }

    public void setStatus(ServerStatus status) {
        this.status = status;
    }

    public String getOperatingSystem() {
        return operatingSystem;
    }

    public void setOperatingSystem(String operatingSystem) {
        this.operatingSystem = operatingSystem;
    }

    public String getCpu() {
        return cpu;
    }

    public void setCpu(String cpu) {
        this.cpu = cpu;
    }

    public String getMemory() {
        return memory;
    }

    public void setMemory(String memory) {
        this.memory = memory;
    }

    public Double getCpuUsage() {
        return cpuUsage != null ? cpuUsage : 0.0;
    }

    public void setCpuUsage(Double cpuUsage) {
        this.cpuUsage = cpuUsage;
    }

    public Double getMemoryUsage() {
        return memoryUsage != null ? memoryUsage : 0.0;
    }

    public void setMemoryUsage(Double memoryUsage) {
        this.memoryUsage = memoryUsage;
    }

    public Double getDiskUsage() {
        return diskUsage != null ? diskUsage : 0.0;
    }

    public void setDiskUsage(Double diskUsage) {
        this.diskUsage = diskUsage;
    }

    public Double getNetworkUsage() {
        return networkUsage != null ? networkUsage : 0.0;
    }

    public void setNetworkUsage(Double networkUsage) {
        this.networkUsage = networkUsage;
    }

    public Double getTemperature() {
        return temperature != null ? temperature : 0.0;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getLoadAvg() {
        return loadAvg != null ? loadAvg : 0.0;
    }

    public void setLoadAvg(Double loadAvg) {
        this.loadAvg = loadAvg;
    }

    public String getUptime() {
        return uptime;
    }

    public void setUptime(String uptime) {
        this.uptime = uptime;
    }

    public Integer getAlertCount() {
        return alertCount != null ? alertCount : 0;
    }

    public void setAlertCount(Integer alertCount) {
        this.alertCount = alertCount;
    }

    public LocalDateTime getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(LocalDateTime lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

