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
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.dto.ServerCreateDto;
import com.elec5619.backend.dto.ServerOverviewDto;
import com.elec5619.backend.dto.ServerResponseDto;
import com.elec5619.backend.dto.ServerUpdateDto;
import com.elec5619.backend.entity.ServerStatus;
import com.elec5619.backend.exception.ServerNameAlreadyExistsException;
import com.elec5619.backend.service.ServerService;
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
@RequestMapping("/api/servers")
@Tag(name = "Server Management", description = "APIs for managing servers")
@CrossOrigin(origins = "*")
public class ServerController {

    @Autowired
    private ServerService serverService;
    
    @Autowired
    private PermissionChecker permissionChecker;

    @PostMapping
    @Operation(summary = "Create Server", description = "Create a new server entry")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Server created",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ServerResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request - Server name already exists"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<ServerResponseDto> create(
            @Valid @RequestBody ServerCreateDto dto,
            @RequestAttribute("userId") Long userId) {
        System.err.println("ServerController.create: Received request for server: " + dto.getServerName());
        System.err.println("ServerController.create: User ID: " + userId);
        
        // 只有Admin和Manager可以创建服务器
        System.err.println("ServerController.create: Checking permissions...");
        permissionChecker.requirePermission(userId, PermissionConstants.SERVER_MANAGE_ALL);
        System.err.println("ServerController.create: Permission check passed, calling service...");
        
        ServerResponseDto server = serverService.create(dto);
        System.err.println("ServerController.create: Service call completed successfully");
        return ResponseEntity.ok(server);
    }

    @GetMapping
    @Operation(summary = "List Servers", description = "List all servers")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Servers retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<List<ServerResponseDto>> listAll(@RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看服务器列表（只读）
        permissionChecker.requirePermission(userId, PermissionConstants.SERVER_READ_ALL);
        return ResponseEntity.ok(serverService.listAll());
    }
    
    @GetMapping("/overview")
    @Operation(summary = "Get Servers Overview", 
               description = "Get all servers with their latest metrics, uptime, and alert counts")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved servers overview",
                    content = @Content(mediaType = "application/json",
                             schema = @Schema(implementation = ServerOverviewDto.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<List<ServerOverviewDto>> getServersOverview(@RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看服务器概览
        permissionChecker.requirePermission(userId, PermissionConstants.SERVER_READ_ALL);
        return ResponseEntity.ok(serverService.getServersOverview());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Server by ID", description = "Retrieve a server by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Server retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
            @ApiResponse(responseCode = "404", description = "Server not found")
    })
    public ResponseEntity<ServerResponseDto> getById(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看服务器详情
        permissionChecker.requirePermission(userId, PermissionConstants.SERVER_READ_ALL);
        return serverService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-name/{serverName}")
    @Operation(summary = "Get Server by Name", description = "Retrieve a server by name")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Server retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
            @ApiResponse(responseCode = "404", description = "Server not found")
    })
    public ResponseEntity<ServerResponseDto> getByName(
            @PathVariable String serverName,
            @RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看服务器详情
        permissionChecker.requirePermission(userId, PermissionConstants.SERVER_READ_ALL);
        return serverService.getByName(serverName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-status/{status}")
    @Operation(summary = "List Servers by Status", description = "Filter servers by status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Servers retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<List<ServerResponseDto>> listByStatus(
            @Parameter(description = "Server status", required = true)
            @PathVariable ServerStatus status,
            @RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看服务器列表
        permissionChecker.requirePermission(userId, PermissionConstants.SERVER_READ_ALL);
        return ResponseEntity.ok(serverService.listByStatus(status));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Server", description = "Update server fields")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Server updated successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
            @ApiResponse(responseCode = "404", description = "Server not found")
    })
    public ResponseEntity<ServerResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody ServerUpdateDto dto,
            @RequestAttribute("userId") Long userId) {
        // 只有Admin和Manager可以更新服务器
        permissionChecker.requirePermission(userId, PermissionConstants.SERVER_MANAGE_ALL);
        return serverService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status/{status}")
    @Operation(summary = "Update Server Status", description = "Update only the server status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Server status updated successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
            @ApiResponse(responseCode = "404", description = "Server not found")
    })
    public ResponseEntity<ServerResponseDto> updateStatus(
            @PathVariable Long id,
            @PathVariable ServerStatus status,
            @RequestAttribute("userId") Long userId) {
        // 只有Admin和Manager可以更新服务器状态
        permissionChecker.requirePermission(userId, PermissionConstants.SERVER_MANAGE_ALL);
        return serverService.updateStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Server", description = "Delete a server by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Server deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
            @ApiResponse(responseCode = "404", description = "Server not found")
    })
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        // 只有Admin和Manager可以删除服务器
        permissionChecker.requirePermission(userId, PermissionConstants.SERVER_MANAGE_ALL);
        boolean deleted = serverService.delete(id);
        if (deleted) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }
}


