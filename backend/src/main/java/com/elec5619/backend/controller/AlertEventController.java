package com.elec5619.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
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
import com.elec5619.backend.dto.AlertEventCreateDto;
import com.elec5619.backend.dto.AlertEventResponseDto;
import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.entity.AlertRule;
import com.elec5619.backend.exception.GlobalExceptionHandler;
import com.elec5619.backend.service.AlertEventService;
import com.elec5619.backend.service.AlertRuleService;
import com.elec5619.backend.service.AlertSystemService;
import com.elec5619.backend.util.PermissionChecker;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/alert-events")
@Tag(name = "Alert Events", description = "Alert event management APIs")
@CrossOrigin(origins = "*")
public class AlertEventController {

    private final AlertEventService alertEventService;
    private final AlertSystemService alertSystemService;
    private final AlertRuleService alertRuleService;
    
    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    public AlertEventController(AlertEventService alertEventService,
                                AlertSystemService alertSystemService,
                                AlertRuleService alertRuleService) {
        this.alertEventService = alertEventService;
        this.alertSystemService = alertSystemService;
        this.alertRuleService = alertRuleService;
    }

    @PostMapping
    @Operation(summary = "Create Alert Event", description = "Create a new alert event record")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Alert event created successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "400", description = "Invalid alert event data", content = @Content),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<AlertEvent> createAlertEvent(
            @Valid @RequestBody AlertEventCreateDto alertEventDto,
            @RequestAttribute("userId") Long userId) {
        // 只有Admin和Manager可以创建告警事件
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
        
        // Convert DTO to Entity
        AlertEvent alertEvent = convertDtoToEntity(alertEventDto);
        
        AlertEvent createdEvent = alertEventService.createAlertEvent(alertEvent);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    /**
     * Convert AlertEventCreateDto to AlertEvent entity
     */
    private AlertEvent convertDtoToEntity(AlertEventCreateDto dto) {
        AlertEvent alertEvent = new AlertEvent();
        
        // Get AlertRule by ruleId
        AlertRule alertRule = alertRuleService.getAlertRuleById(dto.getRuleId())
                .orElseThrow(() -> new IllegalArgumentException("Alert rule with ID " + dto.getRuleId() + " not found"));
        
        alertEvent.setAlertRule(alertRule);
        alertEvent.setServerId(dto.getServerId());
        alertEvent.setStatus(dto.getStatus());
        alertEvent.setStartedAt(dto.getStartedAt());
        alertEvent.setResolvedAt(dto.getResolvedAt());
        alertEvent.setTriggeredValue(dto.getTriggeredValue());
        alertEvent.setSummary(dto.getSummary());
        
        return alertEvent;
    }

    @GetMapping
    @Operation(summary = "Get All Alert Events", description = "Retrieve a list of all alert events in the system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert events retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEventResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<?> getAllAlertEvents(@RequestAttribute("userId") Long userId) {
        try {
            permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
            List<AlertEventResponseDto> events = alertEventService.getAllAlertEventsWithNames();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving alert events: " + e.getMessage());
        }
    }

    @GetMapping("/{eventId}")
    @Operation(summary = "Get Alert Event by ID", description = "Retrieve an alert event by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert event retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
        @ApiResponse(responseCode = "404", description = "Alert event not found", content = @Content)
    })
    public ResponseEntity<?> getAlertEventById(
            @PathVariable Long eventId,
            @RequestAttribute("userId") Long userId) {
        // 所有角色都可以查看告警事件详情
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        return alertEventService.getAlertEventById(eventId)
                .map(e -> {
                    var dto = new AlertEventDto();
                    dto.eventId = e.getEventId();
                    dto.serverName = ""; // Will be populated by service layer
                    dto.ruleName = ""; // Will be populated by service layer
                    dto.status = e.getStatus();
                    dto.startedAt = e.getStartedAt();
                    dto.resolvedAt = e.getResolvedAt();
                    dto.triggeredValue = e.getTriggeredValue();
                    dto.summary = e.getSummary();
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{eventId}")
    @Operation(summary = "Update Alert Event", description = "Update an existing alert event with new data")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert event updated successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
        @ApiResponse(responseCode = "404", description = "Alert event not found", content = @Content),
        @ApiResponse(responseCode = "400", description = "Invalid alert event data", content = @Content)
    })
    public ResponseEntity<AlertEvent> updateAlertEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody AlertEvent alertEvent,
            @RequestAttribute("userId") Long userId) {
        // 只有Admin和Manager可以更新告警事件
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
        try {
            AlertEvent updatedEvent = alertEventService.updateAlertEvent(eventId, alertEvent);
            return ResponseEntity.ok(updatedEvent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{eventId}")
    @Operation(summary = "Delete Alert Event", description = "Delete an alert event by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Alert event deleted successfully", content = @Content),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
        @ApiResponse(responseCode = "404", description = "Alert event not found", content = @Content)
    })
    public ResponseEntity<Void> deleteAlertEvent(
            @PathVariable Long eventId,
            @RequestAttribute("userId") Long userId) {
        // 只有Admin和Manager可以删除告警事件
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
        try {
            alertEventService.deleteAlertEvent(eventId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/rule/{ruleId}")
    @Operation(summary = "Get Alert Events by Rule ID", description = "Retrieve alert events triggered by a specific rule")
    public ResponseEntity<List<AlertEvent>> getAlertEventsByRuleId(
            @PathVariable Long ruleId,
            @RequestAttribute("userId") Long userId) {
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        return ResponseEntity.ok(alertEventService.getAlertEventsByRuleId(ruleId));
    }

    @GetMapping("/server/{serverId}")
    @Operation(summary = "Get Alert Events by Server ID", description = "Retrieve alert events occurring on a specific server")
    public ResponseEntity<List<AlertEvent>> getAlertEventsByServerId(
            @PathVariable Long serverId,
            @RequestAttribute("userId") Long userId) {
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        return ResponseEntity.ok(alertEventService.getAlertEventsByServerId(serverId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get Alert Events by Status", description = "Retrieve alert events by their status")
    public ResponseEntity<List<AlertEvent>> getAlertEventsByStatus(
            @PathVariable String status,
            @RequestAttribute("userId") Long userId) {
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        return ResponseEntity.ok(alertEventService.getAlertEventsByStatus(status));
    }

    @GetMapping("/time-range")
    @Operation(summary = "Get Alert Events by Time Range", description = "Retrieve alert events that started within a specific time range")
    public ResponseEntity<List<AlertEvent>> getAlertEventsByTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestAttribute("userId") Long userId) {
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        return ResponseEntity.ok(alertEventService.getAlertEventsByTimeRange(startTime, endTime));
    }

    @PatchMapping("/{eventId}/resolve")
    @Operation(summary = "Resolve Alert Event", description = "Mark an alert event as resolved")
    public ResponseEntity<AlertEvent> resolveAlertEvent(
            @PathVariable Long eventId,
            @RequestAttribute("userId") Long userId) {
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
        try {
            return ResponseEntity.ok(alertEventService.resolveAlertEvent(eventId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{eventId}/acknowledge")
    @Operation(summary = "Acknowledge Alert Event", description = "Mark an alert event as acknowledged")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert event acknowledged successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
        @ApiResponse(responseCode = "404", description = "Alert event not found", content = @Content)
    })
    public ResponseEntity<AlertEvent> acknowledgeAlertEvent(
            @PathVariable Long eventId,
            @RequestAttribute("userId") Long userId) {
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
        try {
            return ResponseEntity.ok(alertEventService.acknowledgeAlertEvent(eventId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/filtered")
    @Operation(summary = "Get Alert Events with Filters", description = "Retrieve alert events with multiple filter criteria")
    public ResponseEntity<List<AlertEvent>> getAlertEventsWithFilters(
            @RequestParam(required = false) Long ruleId,
            @RequestParam(required = false) Long serverId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestAttribute("userId") Long userId) {
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        return ResponseEntity.ok(alertEventService.getAlertEventsWithFilters(ruleId, serverId, status, startTime, endTime));
    }

    // ✅ 新增：分页过滤接口
    @GetMapping("/filtered-page")
    @Operation(summary = "Get Alert Events with Filters (Paged)",
               description = "Retrieve alert events with multiple filters, supports page/size/sort")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert events retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class)))
    })
    public ResponseEntity<Page<AlertEvent>> getAlertEventsWithFiltersPaged(
            @RequestParam(required = false) Long ruleId,
            @RequestParam(required = false) Long serverId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @Parameter(hidden = true)
            @PageableDefault(sort = "startedAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestAttribute("userId") Long userId) {
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_READ_ALL);
        return ResponseEntity.ok(
                alertEventService.getAlertEventsWithFilters(ruleId, serverId, status, startTime, endTime, pageable));
    }

    // 手动触发
    @PostMapping("/test-trigger")
    @Operation(summary = "Manually trigger an alert", description = "Create an alert event manually for testing")
    public ResponseEntity<?> manualTrigger(
            @Valid @RequestBody AlertEvent alertEvent,
            @RequestAttribute("userId") Long userId) {
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
        try {
            if (alertEvent.getStatus() == null) alertEvent.setStatus("firing");
            if (alertEvent.getStartedAt() == null) alertEvent.setStartedAt(LocalDateTime.now());
            AlertEvent created = alertSystemService.triggerAlert(alertEvent);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            var error = new GlobalExceptionHandler.ErrorResponse(
                LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request", e.getMessage(), null);
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            var error = new GlobalExceptionHandler.ErrorResponse(
                LocalDateTime.now(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error",
                "Failed to trigger alert: " + e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Lightweight DTO to avoid lazy relation serialization issues
    static class AlertEventDto {
        public Long eventId;
        public String serverName;
        public String ruleName;
        public String status;
        public java.time.LocalDateTime startedAt;
        public java.time.LocalDateTime resolvedAt;
        public Double triggeredValue;
        public String summary;
        public java.time.LocalDateTime createdAt;
    }

    // 评估最新指标
    @PostMapping("/evaluate")
    @Operation(summary = "Evaluate latest metrics for a server",
               description = "Evaluate the latest metrics and create alert events if rules are violated")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Metrics evaluated successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "400", description = "Invalid server ID or server not found", content = @Content),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
        @ApiResponse(responseCode = "500", description = "Internal server error during evaluation", content = @Content)
    })
    public ResponseEntity<?> evaluate(
            @RequestParam("serverId") Long serverId,
            @RequestAttribute("userId") Long userId) {
        permissionChecker.requirePermission(userId, PermissionConstants.ALERT_MANAGE_ALL);
        
        // Parameter validation
        if (serverId == null || serverId <= 0) {
            GlobalExceptionHandler.ErrorResponse errorResponse = new GlobalExceptionHandler.ErrorResponse(
                java.time.LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Invalid server ID, must be a positive integer",
                null
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        try {
            List<AlertEvent> triggeredAlerts = alertSystemService.evaluateMetrics(serverId);
            return ResponseEntity.ok(triggeredAlerts);
        } catch (IllegalArgumentException e) {
            GlobalExceptionHandler.ErrorResponse errorResponse = new GlobalExceptionHandler.ErrorResponse(
                java.time.LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Server not found or invalid: " + e.getMessage(),
                null
            );
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            GlobalExceptionHandler.ErrorResponse errorResponse = new GlobalExceptionHandler.ErrorResponse(
                java.time.LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Error occurred while evaluating metrics: " + e.getMessage(),
                null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
