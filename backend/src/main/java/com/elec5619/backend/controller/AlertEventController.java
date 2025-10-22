package com.elec5619.backend.controller;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.exception.GlobalExceptionHandler;
import com.elec5619.backend.service.AlertEventService;
import com.elec5619.backend.service.AlertSystemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/alert-events")
@Tag(name = "Alert Events", description = "Alert event management APIs")
@CrossOrigin(origins = "*")
public class AlertEventController {

    private final AlertEventService alertEventService;
    private final AlertSystemService alertSystemService;

    @Autowired
    public AlertEventController(AlertEventService alertEventService,
                                AlertSystemService alertSystemService) {
        this.alertEventService = alertEventService;
        this.alertSystemService = alertSystemService;
    }

    @PostMapping
    @Operation(summary = "Create Alert Event", description = "Create a new alert event record")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Alert event created successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "400", description = "Invalid alert event data", content = @Content)
    })
    public ResponseEntity<AlertEvent> createAlertEvent(@Valid @RequestBody AlertEvent alertEvent) {
        AlertEvent createdEvent = alertEventService.createAlertEvent(alertEvent);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get All Alert Events", description = "Retrieve a list of all alert events in the system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert events retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<?> getAllAlertEvents() {
        try {
            List<AlertEvent> events = alertEventService.getAllAlertEvents();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            GlobalExceptionHandler.ErrorResponse errorResponse = new GlobalExceptionHandler.ErrorResponse(
                java.time.LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Failed to retrieve alert events: " + e.getMessage(),
                null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{eventId}")
    @Operation(summary = "Get Alert Event by ID", description = "Retrieve an alert event by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert event retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "404", description = "Alert event not found", content = @Content)
    })
    public ResponseEntity<AlertEvent> getAlertEventById(@PathVariable Long eventId) {
        return alertEventService.getAlertEventById(eventId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{eventId}")
    @Operation(summary = "Update Alert Event", description = "Update an existing alert event with new data")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert event updated successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "404", description = "Alert event not found", content = @Content),
        @ApiResponse(responseCode = "400", description = "Invalid alert event data", content = @Content)
    })
    public ResponseEntity<AlertEvent> updateAlertEvent(@PathVariable Long eventId, @Valid @RequestBody AlertEvent alertEvent) {
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
        @ApiResponse(responseCode = "404", description = "Alert event not found", content = @Content)
    })
    public ResponseEntity<Void> deleteAlertEvent(@PathVariable Long eventId) {
        try {
            alertEventService.deleteAlertEvent(eventId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/rule/{ruleId}")
    @Operation(summary = "Get Alert Events by Rule ID", description = "Retrieve alert events triggered by a specific rule")
    public ResponseEntity<List<AlertEvent>> getAlertEventsByRuleId(@PathVariable Long ruleId) {
        return ResponseEntity.ok(alertEventService.getAlertEventsByRuleId(ruleId));
    }

    @GetMapping("/server/{serverId}")
    @Operation(summary = "Get Alert Events by Server ID", description = "Retrieve alert events occurring on a specific server")
    public ResponseEntity<List<AlertEvent>> getAlertEventsByServerId(@PathVariable Long serverId) {
        return ResponseEntity.ok(alertEventService.getAlertEventsByServerId(serverId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get Alert Events by Status", description = "Retrieve alert events by their status")
    public ResponseEntity<List<AlertEvent>> getAlertEventsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(alertEventService.getAlertEventsByStatus(status));
    }

    @GetMapping("/time-range")
    @Operation(summary = "Get Alert Events by Time Range", description = "Retrieve alert events that started within a specific time range")
    public ResponseEntity<List<AlertEvent>> getAlertEventsByTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return ResponseEntity.ok(alertEventService.getAlertEventsByTimeRange(startTime, endTime));
    }

    @PatchMapping("/{eventId}/resolve")
    @Operation(summary = "Resolve Alert Event", description = "Mark an alert event as resolved")
    public ResponseEntity<AlertEvent> resolveAlertEvent(@PathVariable Long eventId) {
        try {
            return ResponseEntity.ok(alertEventService.resolveAlertEvent(eventId));
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
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
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
            @PageableDefault(sort = "startedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(
                alertEventService.getAlertEventsWithFilters(ruleId, serverId, status, startTime, endTime, pageable));
    }

    // 手动触发
    @PostMapping("/test-trigger")
    @Operation(summary = "Manually trigger an alert", description = "Create an alert event manually for testing")
    public ResponseEntity<?> manualTrigger(@Valid @RequestBody AlertEvent alertEvent) {
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

    // 评估最新指标
    @PostMapping("/evaluate")
    @Operation(summary = "Evaluate latest metrics for a server",
               description = "Evaluate the latest metrics and create alert events if rules are violated")
    public ResponseEntity<List<AlertEvent>> evaluate(@RequestParam("serverId") Long serverId) {
        return ResponseEntity.ok(alertSystemService.evaluateMetrics(serverId));
    }
}
