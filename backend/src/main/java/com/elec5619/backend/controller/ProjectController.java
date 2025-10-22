package com.elec5619.backend.controller;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.dto.ProjectCreateDto;
import com.elec5619.backend.dto.ProjectResponseDto;
import com.elec5619.backend.dto.ProjectUpdateDto;
import com.elec5619.backend.entity.ProjectStatus;
import com.elec5619.backend.service.ProjectService;
import com.elec5619.backend.util.PermissionChecker;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Project Management", description = "APIs for managing projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;
    
    @Autowired
    private PermissionChecker permissionChecker;

    @PostMapping
    @Operation(
        summary = "Create Project", 
        description = "Create a new project with optional server assignments and member assignments. Project members can be specified during creation."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Project created successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data or validation errors"),
        @ApiResponse(responseCode = "409", description = "Project name already exists")
    })
    public ResponseEntity<ProjectResponseDto> create(
            @Parameter(description = "Project creation data including name, servers, duration, and member user IDs")
            @Valid @RequestBody ProjectCreateDto dto,
            @Parameter(description = "User ID", required = true)
            @RequestHeader("User-ID") Long userId) {
        // 检查用户是否有创建项目的权限
        permissionChecker.requirePermission(userId, PermissionConstants.PROJECT_WRITE_OWN);
        return ResponseEntity.ok(projectService.create(dto));
    }

    @GetMapping
    @Operation(summary = "List Projects", description = "List all projects")
    public ResponseEntity<List<ProjectResponseDto>> listAll() {
        return ResponseEntity.ok(projectService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Project by ID", description = "Retrieve a project by ID")
    public ResponseEntity<ProjectResponseDto> getById(
            @Parameter(description = "Project ID", required = true, example = "1")
            @PathVariable Long id,
            @Parameter(description = "User ID", required = true)
            @RequestHeader("User-ID") Long userId) {
        // 检查用户是否有访问该项目的权限
        permissionChecker.requireProjectAccess(userId, id, "read");
        return projectService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-name/{projectName}")
    @Operation(summary = "Get Project by Name", description = "Retrieve a project by name")
    public ResponseEntity<ProjectResponseDto> getByName(@PathVariable String projectName) {
        return projectService.getByName(projectName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-status/{status}")
    @Operation(summary = "List Projects by Status", description = "Filter projects by status")
    public ResponseEntity<List<ProjectResponseDto>> listByStatus(
            @Parameter(description = "Project status", required = true)
            @PathVariable ProjectStatus status) {
        return ResponseEntity.ok(projectService.listByStatus(status));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Project", description = "Update project fields")
    public ResponseEntity<ProjectResponseDto> update(
            @Parameter(description = "Project ID", required = true, example = "1")
            @PathVariable Long id,
            @Parameter(description = "Project update data")
            @Valid @RequestBody ProjectUpdateDto dto,
            @Parameter(description = "User ID", required = true)
            @RequestHeader("User-ID") Long userId) {
        // 检查用户是否有更新该项目的权限
        permissionChecker.requireProjectAccess(userId, id, "write");
        return projectService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status/{status}")
    @Operation(summary = "Update Project Status", description = "Update only the project status")
    public ResponseEntity<ProjectResponseDto> updateStatus(
            @PathVariable Long id,
            @PathVariable ProjectStatus status) {
        return projectService.updateStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Project", description = "Delete a project by ID")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean deleted = projectService.delete(id);
        if (deleted) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/members")
    @Operation(
        summary = "Add Project Members", 
        description = "Add users to a project. Users will be added as project members if they don't already exist in the project."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Members added successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "Project not found"),
        @ApiResponse(responseCode = "400", description = "Invalid user IDs provided")
    })
    public ResponseEntity<ProjectResponseDto> addMembers(
            @Parameter(description = "Project ID", required = true, example = "1")
            @PathVariable Long id,
            @Parameter(description = "Set of user IDs to add as project members", required = true, example = "[2, 3, 4]")
            @RequestBody Set<Long> userIds,
            @Parameter(description = "User ID", required = true)
            @RequestHeader("User-ID") Long userId) {
        // 只有admin和manager可以添加项目成员
        if (!permissionChecker.isAdmin(userId) && !permissionChecker.isManager(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Only admin and manager can add project members");
        }
        return projectService.addMembers(id, userIds)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/members")
    @Operation(
        summary = "Remove Project Members", 
        description = "Remove users from a project. Users will be removed from the project if they are currently members."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Members removed successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "Project not found"),
        @ApiResponse(responseCode = "400", description = "Invalid user IDs provided"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<ProjectResponseDto> removeMembers(
            @Parameter(description = "Project ID", required = true, example = "1")
            @PathVariable Long id,
            @Parameter(description = "Set of user IDs to remove from project members", required = true, example = "[2, 3]")
            @RequestBody Set<Long> userIds,
            @Parameter(description = "User ID", required = true)
            @RequestHeader("User-ID") Long userId) {
        // 只有admin和manager可以移除项目成员
        if (!permissionChecker.isAdmin(userId) && !permissionChecker.isManager(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Only admin and manager can remove project members");
        }
        return projectService.removeMembers(id, userIds)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/members")
    @Operation(
        summary = "Get Project Members", 
        description = "Retrieve all user IDs who are members of the specified project."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Project members retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(type = "array", example = "[1, 2, 3, 4]"))),
        @ApiResponse(responseCode = "404", description = "Project not found")
    })
    public ResponseEntity<Set<Long>> getMembers(
            @Parameter(description = "Project ID", required = true, example = "1")
            @PathVariable Long id) {
        return projectService.getProjectMembers(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-user/{userId}")
    @Operation(
        summary = "Get Projects by User ID", 
        description = "Retrieve all projects that the specified user is a member of."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User projects retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(type = "array", implementation = ProjectResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<List<ProjectResponseDto>> getProjectsByUserId(
            @Parameter(description = "User ID", required = true, example = "1")
            @PathVariable Long userId) {
        try {
            List<ProjectResponseDto> projects = projectService.getProjectsByUserId(userId);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}


