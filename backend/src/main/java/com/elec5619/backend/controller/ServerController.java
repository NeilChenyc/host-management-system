package com.elec5619.backend.controller;

import java.util.List;
import java.util.Map;

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

import com.elec5619.backend.dto.ServerCreateDto;
import com.elec5619.backend.dto.ServerResponseDto;
import com.elec5619.backend.dto.ServerUpdateDto;
import com.elec5619.backend.entity.ServerStatus;
import com.elec5619.backend.exception.ServerNameAlreadyExistsException;
import com.elec5619.backend.service.ServerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/servers")
@Tag(name = "Server Management", description = "APIs for managing servers")
@CrossOrigin(origins = "*")
public class ServerController {

    @Autowired
    private ServerService serverService;

    @PostMapping
    @Operation(summary = "Create Server", description = "Create a new server entry")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Server created",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ServerResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request - Server name already exists")
    })
    public ResponseEntity<?> create(@Valid @RequestBody ServerCreateDto dto) {
        try {
            ServerResponseDto server = serverService.create(dto);
            return ResponseEntity.ok(server);
        } catch (ServerNameAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "timestamp", java.time.LocalDateTime.now(),
                "status", 400,
                "error", "Bad Request",
                "message", e.getMessage(),
                "details", null
            ));
        }
    }

    @GetMapping
    @Operation(summary = "List Servers", description = "List all servers")
    public ResponseEntity<List<ServerResponseDto>> listAll() {
        return ResponseEntity.ok(serverService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Server by ID", description = "Retrieve a server by ID")
    public ResponseEntity<ServerResponseDto> getById(@PathVariable Long id) {
        return serverService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-name/{serverName}")
    @Operation(summary = "Get Server by Name", description = "Retrieve a server by name")
    public ResponseEntity<ServerResponseDto> getByName(@PathVariable String serverName) {
        return serverService.getByName(serverName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-status/{status}")
    @Operation(summary = "List Servers by Status", description = "Filter servers by status")
    public ResponseEntity<List<ServerResponseDto>> listByStatus(
            @Parameter(description = "Server status", required = true)
            @PathVariable ServerStatus status) {
        return ResponseEntity.ok(serverService.listByStatus(status));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Server", description = "Update server fields")
    public ResponseEntity<ServerResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody ServerUpdateDto dto) {
        return serverService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status/{status}")
    @Operation(summary = "Update Server Status", description = "Update only the server status")
    public ResponseEntity<ServerResponseDto> updateStatus(
            @PathVariable Long id,
            @PathVariable ServerStatus status) {
        return serverService.updateStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Server", description = "Delete a server by ID")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean deleted = serverService.delete(id);
        if (deleted) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }
}


