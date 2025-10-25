package com.elec5619.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.exception.GlobalExceptionHandler;
import com.elec5619.backend.service.AlertRuleService;
import com.elec5619.backend.util.PermissionChecker;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Alert Rule controller.
 * Provides REST endpoints for alert rule CRUD operations.
 */
@RestController
@RequestMapping("/api/alert-rules")
@Tag(name = "Alert Rules", description = "Alert rule management APIs")
@CrossOrigin(origins = "*")
public class AlertRuleController {

    private final AlertRuleService alertRuleService;
    
    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    public AlertRuleController(AlertRuleService alertRuleService) {
        this.alertRuleService = alertRuleService;
    }

    /**
     * Create a new alert rule
     * @param alertRule Alert rule data
     * @return Created alert rule
     */
    @PostMapping
    @Operation(
        summary = "Create Alert Rule",
        description = "Create a new alert rule with specified conditions"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Alert rule created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertRule.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid alert rule data or duplicate rule name",
            content = @Content
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<?> createAlertRule(
            @Valid @RequestBody AlertRule alertRule,
            @RequestAttribute("userId") Long userId) {
        // 只有Admin和Manager可以创建告警规则
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
        try {
            if (alertRule.getEnabled() == null) {
                alertRule.setEnabled(true);
            }
            AlertRule createdRule = alertRuleService.createAlertRule(alertRule);
            return new ResponseEntity<>(createdRule, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            GlobalExceptionHandler.ErrorResponse errorResponse = new GlobalExceptionHandler.ErrorResponse(
                java.time.LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                e.getMessage(),
                null
            );
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            GlobalExceptionHandler.ErrorResponse errorResponse = new GlobalExceptionHandler.ErrorResponse(
                java.time.LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to create alert rule: " + e.getMessage(),
                null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get all alert rules
     * @return List of all alert rules
     */
    @GetMapping
    @Operation(
        summary = "Get All Alert Rules",
        description = "Retrieve a list of all alert rules in the system"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert rules retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertRule.class)
            )
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<List<AlertRule>> getAllAlertRules(@RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看告警规则列表（只读）
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        List<AlertRule> rules = alertRuleService.getAllAlertRules();
        return ResponseEntity.ok(rules);
    }

    /**
     * Get alert rule by ID
     * @param ruleId ID of the alert rule to retrieve
     * @return Alert rule with the specified ID
     */
    @GetMapping("/{ruleId}")
    @Operation(
        summary = "Get Alert Rule by ID",
        description = "Retrieve an alert rule by its ID"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert rule retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertRule.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Alert rule not found",
            content = @Content
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<AlertRule> getAlertRuleById(
            @PathVariable Long ruleId,
            @RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看告警规则详情
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        return alertRuleService.getAlertRuleById(ruleId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Update an existing alert rule
     * @param ruleId ID of the alert rule to update
     * @param alertRule Updated alert rule data
     * @return Updated alert rule
     */
    @PutMapping("/{ruleId}")
    @Operation(
        summary = "Update Alert Rule",
        description = "Update an existing alert rule with new data"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert rule updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertRule.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Alert rule not found",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid alert rule data",
            content = @Content
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<AlertRule> updateAlertRule(
            @PathVariable Long ruleId,
            @Valid @RequestBody AlertRule alertRule,
            @RequestAttribute("userId") Long userId) {
        // 只有Admin和Manager可以更新告警规则
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
        try {
            AlertRule updatedRule = alertRuleService.updateAlertRule(ruleId, alertRule);
            return ResponseEntity.ok(updatedRule);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete an alert rule
     * @param ruleId ID of the alert rule to delete
     */
    @DeleteMapping("/{ruleId}")
    @Operation(
        summary = "Delete Alert Rule",
        description = "Delete an alert rule by its ID"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "204",
            description = "Alert rule deleted successfully",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Alert rule not found",
            content = @Content
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<Void> deleteAlertRule(
            @PathVariable Long ruleId,
            @RequestAttribute("userId") Long userId) {
        // 只有Admin和Manager可以删除告警规则
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
        try {
            alertRuleService.deleteAlertRule(ruleId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get alert rules by enabled status
     * @param enabled Enabled status to filter by
     * @return List of alert rules with the specified enabled status
     */
    @GetMapping("/enabled/{enabled}")
    @Operation(
        summary = "Get Alert Rules by Enabled Status",
        description = "Retrieve alert rules by their enabled status"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert rules retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertRule.class)
            )
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<List<AlertRule>> getAlertRulesByEnabled(
            @PathVariable Boolean enabled,
            @RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看告警规则列表
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        List<AlertRule> rules = alertRuleService.getAlertRulesByEnabled(enabled);
        return ResponseEntity.ok(rules);
    }

    /**
     * Get alert rules by severity
     * @param severity Severity to filter by
     * @return List of alert rules with the specified severity
     */
    @GetMapping("/severity/{severity}")
    @Operation(
        summary = "Get Alert Rules by Severity",
        description = "Retrieve alert rules by their severity level"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert rules retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertRule.class)
            )
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<List<AlertRule>> getAlertRulesBySeverity(
            @PathVariable String severity,
            @RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看告警规则列表
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        List<AlertRule> rules = alertRuleService.getAlertRulesBySeverity(severity);
        return ResponseEntity.ok(rules);
    }

    /**
     * Toggle alert rule status (enable/disable)
     * @param ruleId ID of the alert rule to toggle
     * @param enabled New enabled status
     * @return Updated alert rule
     */
    @PatchMapping("/{ruleId}/status")
    @Operation(
        summary = "Toggle Alert Rule Status",
        description = "Enable or disable an alert rule"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert rule status updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertRule.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Alert rule not found",
            content = @Content
        ),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<AlertRule> toggleAlertRuleStatus(
            @PathVariable Long ruleId,
            @RequestParam Boolean enabled,
            @RequestAttribute("userId") Long userId) {
        // 只有Admin和Manager可以修改告警规则状态
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
        try {
            AlertRule updatedRule = alertRuleService.toggleAlertRuleStatus(ruleId, enabled);
            return ResponseEntity.ok(updatedRule);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get alert rules by project ID
     */
    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get Alert Rules by Project", description = "Retrieve alert rules under a specific project")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Alert rules retrieved",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertRule.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<List<AlertRule>> getRulesByProject(
            @PathVariable Long projectId,
            @RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看告警规则列表
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        return ResponseEntity.ok(alertRuleService.getAlertRulesByProjectId(projectId));
    }
}
