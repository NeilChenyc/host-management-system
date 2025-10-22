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
import com.elec5619.backend.entity.ProjectMember;
import com.elec5619.backend.entity.ProjectStatus;
import com.elec5619.backend.entity.Server;
import com.elec5619.backend.entity.User;
import com.elec5619.backend.exception.ProjectNameAlreadyExistsException;
import com.elec5619.backend.exception.ServerNotFoundException;
import com.elec5619.backend.exception.UserNotFoundException;
import com.elec5619.backend.repository.ProjectMemberRepository;
import com.elec5619.backend.repository.ProjectRepository;
import com.elec5619.backend.repository.ServerRepository;
import com.elec5619.backend.repository.UserRepository;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ServerRepository serverRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    public ProjectResponseDto create(ProjectCreateDto dto) {
        if (projectRepository.findByProjectName(dto.getProjectName()).isPresent()) {
            throw new ProjectNameAlreadyExistsException("Project name already exists: " + dto.getProjectName());
        }
        Project p = new Project();
        p.setProjectName(dto.getProjectName());
        
        // 先验证所有服务器ID是否存在，如果任何一个不存在则抛出异常
        if (dto.getServers() != null && !dto.getServers().isEmpty()) {
            for (Long serverId : dto.getServers()) {
                if (!serverRepository.existsById(serverId)) {
                    throw new ServerNotFoundException("Server not found: " + serverId);
                }
            }
        }
        
        // 设置服务器（此时所有服务器ID都已验证存在）
        if (dto.getServers() != null && !dto.getServers().isEmpty()) {
            Set<Server> servers = dto.getServers().stream()
                    .map(id -> serverRepository.findById(id).get()) // 使用get()因为已经验证存在
                    .collect(Collectors.toSet());
            p.setServers(servers);
        }
        p.setDuration(dto.getDuration());
        p.setStatus(ProjectStatus.PLANNED);
        
        // 先验证所有用户ID是否存在，如果任何一个不存在则抛出异常
        if (dto.getUserIds() != null && !dto.getUserIds().isEmpty()) {
            for (Long userId : dto.getUserIds()) {
                if (!userRepository.existsById(userId)) {
                    throw new UserNotFoundException("User not found: " + userId);
                }
            }
        }
        
        Project saved = projectRepository.save(p);
        
        // 添加项目成员（此时所有用户ID都已验证存在）
        if (dto.getUserIds() != null && !dto.getUserIds().isEmpty()) {
            for (Long userId : dto.getUserIds()) {
                User user = userRepository.findById(userId).get(); // 使用get()因为已经验证存在
                
                // 检查用户是否已经是项目成员
                if (!projectMemberRepository.findByProjectIdAndUserId(saved.getId(), userId).isPresent()) {
                    ProjectMember projectMember = new ProjectMember(saved, user);
                    projectMemberRepository.save(projectMember);
                }
            }
        }
        
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
                                .orElseThrow(() -> new ServerNotFoundException("Server not found: " + id2)))
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

    public Optional<ProjectResponseDto> addMembers(Long projectId, Set<Long> userIds) {
        return projectRepository.findById(projectId).map(project -> {
            if (userIds != null && !userIds.isEmpty()) {
                for (Long userId : userIds) {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));
                    
                    // 检查用户是否已经是项目成员
                    if (!projectMemberRepository.findByProjectIdAndUserId(projectId, userId).isPresent()) {
                        ProjectMember projectMember = new ProjectMember(project, user);
                        projectMemberRepository.save(projectMember);
                    }
                }
            }
            return toResponse(project);
        });
    }

    public Optional<ProjectResponseDto> removeMembers(Long projectId, Set<Long> userIds) {
        return projectRepository.findById(projectId).map(project -> {
            if (userIds != null && !userIds.isEmpty()) {
                for (Long userId : userIds) {
                    projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                            .ifPresent(projectMemberRepository::delete);
                }
            }
            return toResponse(project);
        });
    }

    public Optional<Set<Long>> getProjectMembers(Long projectId) {
        return projectRepository.findById(projectId).map(project -> {
            List<ProjectMember> projectMembers = projectMemberRepository.findByProjectId(projectId);
            return projectMembers.stream()
                    .map(pm -> pm.getUser().getId())
                    .collect(Collectors.toSet());
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
        
        // 获取项目成员用户ID列表
        List<ProjectMember> projectMembers = projectMemberRepository.findByProjectId(p.getId());
        if (projectMembers != null && !projectMembers.isEmpty()) {
            Set<Long> userIds = projectMembers.stream()
                    .map(pm -> pm.getUser().getId())
                    .collect(Collectors.toSet());
            dto.setUserIds(userIds);
        }
        
        dto.setDuration(p.getDuration());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}


