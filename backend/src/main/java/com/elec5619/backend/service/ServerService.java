package com.elec5619.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elec5619.backend.dto.ServerCreateDto;
import com.elec5619.backend.dto.ServerOverviewDto;
import com.elec5619.backend.dto.ServerResponseDto;
import com.elec5619.backend.dto.ServerUpdateDto;
import com.elec5619.backend.entity.Server;
import com.elec5619.backend.entity.ServerMetrics;
import com.elec5619.backend.entity.ServerStatus;
import com.elec5619.backend.exception.ServerNameAlreadyExistsException;
import com.elec5619.backend.repository.ServerRepository;

@Service
public class ServerService {

    @Autowired
    private ServerRepository serverRepository;
    
    @Autowired
    private ServerMetricsService serverMetricsService;
    
    @Autowired
    private AlertEventService alertEventService;

    public ServerResponseDto create(ServerCreateDto dto) {
        if (serverRepository.findByServerName(dto.getServerName()).isPresent()) {
            throw new ServerNameAlreadyExistsException("Server name already exists");
        }
        Server server = new Server();
        server.setServerName(dto.getServerName());
        server.setIpAddress(dto.getIpAddress());
        server.setOperatingSystem(dto.getOperatingSystem());
        server.setCpu(dto.getCpu());
        server.setMemory(dto.getMemory());
        // Set status from DTO if provided, otherwise default to unknown
        server.setStatus(dto.getStatus() != null ? dto.getStatus() : ServerStatus.unknown);
        Server saved = serverRepository.save(server);
        return toResponse(saved);
    }

    public List<ServerResponseDto> listAll() {
        return serverRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Optional<ServerResponseDto> getById(Long id) {
        return serverRepository.findById(id).map(this::toResponse);
    }

    public Optional<ServerResponseDto> getByName(String name) {
        return serverRepository.findByServerName(name).map(this::toResponse);
    }

    public List<ServerResponseDto> listByStatus(ServerStatus status) {
        return serverRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Optional<ServerResponseDto> update(Long id, ServerUpdateDto dto) {
        return serverRepository.findById(id).map(server -> {
            if (dto.getServerName() != null) server.setServerName(dto.getServerName());
            if (dto.getIpAddress() != null) server.setIpAddress(dto.getIpAddress());
            if (dto.getOperatingSystem() != null) server.setOperatingSystem(dto.getOperatingSystem());
            if (dto.getCpu() != null) server.setCpu(dto.getCpu());
            if (dto.getMemory() != null) server.setMemory(dto.getMemory());
            if (dto.getStatus() != null) {
                server.setStatus(dto.getStatus());
            }
            
            Server saved = serverRepository.save(server);
            return toResponse(saved);
        });
    }

    public boolean delete(Long id) {
        if (!serverRepository.existsById(id)) {
            return false;
        }
        serverRepository.deleteById(id);
        return true;
    }

    public Optional<ServerResponseDto> updateStatus(Long id, ServerStatus status) {
        return serverRepository.findById(id).map(server -> {
            server.setStatus(status);
            Server saved = serverRepository.save(server);
            return toResponse(saved);
        });
    }

    private ServerResponseDto toResponse(Server server) {
        ServerResponseDto dto = new ServerResponseDto();
        dto.setId(server.getId());
        dto.setServerName(server.getServerName());
        dto.setIpAddress(server.getIpAddress());
        dto.setStatus(server.getStatus());
        dto.setOperatingSystem(server.getOperatingSystem());
        dto.setCpu(server.getCpu());
        dto.setMemory(server.getMemory());
        dto.setCreatedAt(server.getCreatedAt());
        dto.setUpdatedAt(server.getUpdatedAt());
        return dto;
    }
    
    /**
     * Get server overview including basic info and latest metrics
     */
    public List<ServerOverviewDto> getServersOverview() {
        return serverRepository.findAll().stream()
                .map(this::toOverview)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert Server entity to ServerOverviewDto with latest metrics and alert count
     */
    private ServerOverviewDto toOverview(Server server) {
        ServerOverviewDto dto = new ServerOverviewDto();
        
        // Basic server info
        dto.setId(server.getId());
        dto.setHostname(server.getServerName());
        dto.setIpAddress(server.getIpAddress());
        dto.setStatus(server.getStatus());
        dto.setOperatingSystem(server.getOperatingSystem());
        dto.setCpu(server.getCpu());
        dto.setMemory(server.getMemory());
        dto.setCreatedAt(server.getCreatedAt());
        
        // Get latest metrics
        Optional<ServerMetrics> latestMetrics = serverMetricsService.getLatestMetrics(server.getId());
        if (latestMetrics.isPresent()) {
            ServerMetrics metrics = latestMetrics.get();
            dto.setCpuUsage(metrics.getCpuUsage());
            dto.setMemoryUsage(metrics.getMemoryUsage());
            dto.setDiskUsage(metrics.getDiskUsage());
            // Combine network in and out for network usage
            Double networkIn = metrics.getNetworkIn() != null ? metrics.getNetworkIn() : 0.0;
            Double networkOut = metrics.getNetworkOut() != null ? metrics.getNetworkOut() : 0.0;
            double avgNetwork = (networkIn + networkOut) / 2.0;
            dto.setNetworkUsage(BigDecimal.valueOf(avgNetwork).setScale(2, RoundingMode.HALF_UP).doubleValue());
            dto.setTemperature(metrics.getTemperature());
            dto.setLoadAvg(metrics.getLoadAvg());
            dto.setLastUpdate(metrics.getCollectedAt());
        } else {
            // Set default values if no metrics available
            dto.setCpuUsage(0.0);
            dto.setMemoryUsage(0.0);
            dto.setDiskUsage(0.0);
            dto.setNetworkUsage(0.0);
            dto.setTemperature(0.0);
            dto.setLoadAvg(0.0);
            dto.setLastUpdate(server.getUpdatedAt());
        }
        
        // Calculate uptime
        dto.setUptime(calculateUptime(server.getCreatedAt()));
        
        // Get alert count for this server
        try {
            // Count active alerts for this server
            long alertCount = alertEventService.getAlertEventsByStatus("firing").stream()
                    .filter(alert -> alert.getServerId().equals(server.getId()))
                    .count();
            dto.setAlertCount((int) alertCount);
        } catch (Exception e) {
            dto.setAlertCount(0);
        }
        
        return dto;
    }
    
    /**
     * Calculate uptime string from creation time
     */
    private String calculateUptime(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "0d 0h 0m";
        }
        
        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        long days = duration.toDays();
        long hours = duration.toHours() % 24;
        long minutes = duration.toMinutes() % 60;
        
        return String.format("%dd %dh %dm", days, hours, minutes);
    }
}


