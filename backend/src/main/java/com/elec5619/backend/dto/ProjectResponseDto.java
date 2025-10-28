package com.elec5619.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.elec5619.backend.entity.ProjectStatus;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response DTO for project data")
public class ProjectResponseDto {

    @Schema(description = "Project ID", example = "1")
    private Long id;
    
    @Schema(description = "Name of the project", example = "Web Development Project")
    private String projectName;
    
    @Schema(description = "Current status of the project", example = "PLANNED")
    private ProjectStatus status;
    
    @Schema(description = "List of servers assigned to this project with detailed information")
    private List<ServerSummaryDto> servers;
    
    @Schema(description = "Set of user IDs who are project members", example = "[1, 2, 3, 4]")
    private Set<Long> userIds; // 项目成员用户ID列表
    
    @Schema(description = "Project duration", example = "3 months")
    private String duration;
    
    @Schema(description = "Project creation timestamp", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "Project last update timestamp", example = "2024-01-15T14:45:00")
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public List<ServerSummaryDto> getServers() {
        return servers;
    }

    public void setServers(List<ServerSummaryDto> servers) {
        this.servers = servers;
    }

    public Set<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(Set<Long> userIds) {
        this.userIds = userIds;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}


