package com.elec5619.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elec5619.backend.dto.ProjectCreateDto;
import com.elec5619.backend.dto.ProjectResponseDto;
import com.elec5619.backend.dto.ProjectUpdateDto;
import com.elec5619.backend.entity.ProjectStatus;
import com.elec5619.backend.service.ProjectService;

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

    @PostMapping
    @Operation(summary = "Create Project", description = "Create a new project")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Project created",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProjectResponseDto.class)))
    })
    public ResponseEntity<ProjectResponseDto> create(@Valid @RequestBody ProjectCreateDto dto) {
        return ResponseEntity.ok(projectService.create(dto));
    }

    @GetMapping
    @Operation(summary = "List Projects", description = "List all projects")
    public ResponseEntity<List<ProjectResponseDto>> listAll() {
        return ResponseEntity.ok(projectService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Project by ID", description = "Retrieve a project by ID")
    public ResponseEntity<ProjectResponseDto> getById(@PathVariable Long id) {
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
            @PathVariable Long id,
            @Valid @RequestBody ProjectUpdateDto dto) {
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
}


