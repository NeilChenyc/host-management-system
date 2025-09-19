package com.elec5619.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elec5619.backend.dto.ProjectCreateDto;
import com.elec5619.backend.dto.ProjectResponseDto;
import com.elec5619.backend.dto.ProjectUpdateDto;
import com.elec5619.backend.entity.Project;
import com.elec5619.backend.entity.ProjectStatus;
import com.elec5619.backend.entity.Server;
import com.elec5619.backend.repository.ProjectRepository;
import com.elec5619.backend.repository.ServerRepository;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ServerRepository serverRepository;

    public ProjectResponseDto create(ProjectCreateDto dto) {
        if (projectRepository.findByProjectName(dto.getProjectName()).isPresent()) {
            throw new RuntimeException("Project name already exists");
        }
        Project p = new Project();
        p.setProjectName(dto.getProjectName());
        // manager/team removed
        if (dto.getServers() != null && !dto.getServers().isEmpty()) {
            Set<Server> servers = dto.getServers().stream()
                    .map(id -> serverRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Server not found: " + id)))
                    .collect(Collectors.toSet());
            p.setServers(servers);
        }
        p.setDuration(dto.getDuration());
        p.setStatus(ProjectStatus.PLANNED);
        Project saved = projectRepository.save(p);
        return toResponse(saved);
    }

    public List<ProjectResponseDto> listAll() {
        return projectRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Optional<ProjectResponseDto> getById(Long id) {
        return projectRepository.findById(id).map(this::toResponse);
    }

    public Optional<ProjectResponseDto> getByName(String name) {
        return projectRepository.findByProjectName(name).map(this::toResponse);
    }

    public List<ProjectResponseDto> listByStatus(ProjectStatus status) {
        return projectRepository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Optional<ProjectResponseDto> update(Long id, ProjectUpdateDto dto) {
        return projectRepository.findById(id).map(p -> {
            if (dto.getProjectName() != null) p.setProjectName(dto.getProjectName());
            // manager/team removed
            if (dto.getServers() != null) {
                Set<Server> servers = dto.getServers().stream()
                        .map(id2 -> serverRepository.findById(id2)
                                .orElseThrow(() -> new RuntimeException("Server not found: " + id2)))
                        .collect(Collectors.toSet());
                p.setServers(servers);
            }
            if (dto.getDuration() != null) p.setDuration(dto.getDuration());
            Project saved = projectRepository.save(p);
            return toResponse(saved);
        });
    }

    public boolean delete(Long id) {
        if (!projectRepository.existsById(id)) return false;
        projectRepository.deleteById(id);
        return true;
    }

    public Optional<ProjectResponseDto> updateStatus(Long id, ProjectStatus status) {
        return projectRepository.findById(id).map(p -> {
            p.setStatus(status);
            Project saved = projectRepository.save(p);
            return toResponse(saved);
        });
    }

    private ProjectResponseDto toResponse(Project p) {
        ProjectResponseDto dto = new ProjectResponseDto();
        dto.setId(p.getId());
        dto.setProjectName(p.getProjectName());
        dto.setStatus(p.getStatus());
        if (p.getServers() != null) {
            Set<Long> ids = p.getServers().stream().map(Server::getId).collect(Collectors.toSet());
            dto.setServers(ids);
        }
        // manager/team removed
        dto.setDuration(p.getDuration());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}


