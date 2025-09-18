package com.elec5619.backend.dto;

import java.time.LocalDateTime;
import java.util.Set;

import com.elec5619.backend.entity.ProjectStatus;

public class ProjectResponseDto {

    private Long id;
    private String projectName;
    private ProjectStatus status;
    private Set<Long> servers;
    private String duration;
    private LocalDateTime createdAt;
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

    public Set<Long> getServers() {
        return servers;
    }

    public void setServers(Set<Long> servers) {
        this.servers = servers;
    }

    // manager/team removed

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


