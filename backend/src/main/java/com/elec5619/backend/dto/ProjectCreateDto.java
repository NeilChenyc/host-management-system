package com.elec5619.backend.dto;

import java.util.Set;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Data transfer object for creating a new project")
public class ProjectCreateDto {

    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 150, message = "Project name must be between 2 and 150 characters")
    @Schema(description = "Name of the project", example = "Web Development Project", required = true)
    private String projectName;

    @Schema(description = "Set of server IDs to assign to this project", example = "[1, 2, 3]")
    private Set<Long> servers;

    @Schema(description = "Project duration", example = "3 months")
    private String duration;

    @Schema(description = "Set of user IDs to add as project members", example = "[1, 2, 3, 4]")
    private Set<Long> userIds;

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }


    public Set<Long> getServers() {
        return servers;
    }

    public void setServers(Set<Long> servers) {
        this.servers = servers;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public Set<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(Set<Long> userIds) {
        this.userIds = userIds;
    }

    
      
}


