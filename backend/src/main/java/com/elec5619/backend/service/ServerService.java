package com.elec5619.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elec5619.backend.dto.ServerCreateDto;
import com.elec5619.backend.dto.ServerResponseDto;
import com.elec5619.backend.dto.ServerUpdateDto;
import com.elec5619.backend.entity.Server;
import com.elec5619.backend.entity.ServerStatus;
import com.elec5619.backend.repository.ServerRepository;

@Service
public class ServerService {

    @Autowired
    private ServerRepository serverRepository;

    public ServerResponseDto create(ServerCreateDto dto) {
        if (serverRepository.findByServerName(dto.getServerName()).isPresent()) {
            throw new RuntimeException("Server name already exists");
        }
        Server server = new Server();
        server.setServerName(dto.getServerName());
        server.setIpAddress(dto.getIpAddress());
        server.setOperatingSystem(dto.getOperatingSystem());
        server.setCpu(dto.getCpu());
        server.setMemory(dto.getMemory());
        server.setStatus(ServerStatus.UP);
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
            server.setLastUpdate(LocalDateTime.now());
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
        dto.setLastUpdate(server.getLastUpdate());
        dto.setCreatedAt(server.getCreatedAt());
        dto.setUpdatedAt(server.getUpdatedAt());
        return dto;
    }
}


