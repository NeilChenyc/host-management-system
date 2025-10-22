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
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Alert Event controller.
 * Provides REST endpoints for alert event CRUD operations.
 */
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

    /**
     * Create a new alert event
     */
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

    /**
     * Get all alert events
     */
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

    /**
     * Get alert event by ID
     */
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

    /**
     * Update an existing alert event
     */
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

    /**
     * Delete an alert event
     */
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

    /**
     * Get alert events by rule ID
     */
    @GetMapping("/rule/{ruleId}")
    @Operation(summary = "Get Alert Events by Rule ID", description = "Retrieve alert events triggered by a specific rule")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert events retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class)))
    })
    public ResponseEntity<List<AlertEvent>> getAlertEventsByRuleId(@PathVariable Long ruleId) {
        List<AlertEvent> events = alertEventService.getAlertEventsByRuleId(ruleId);
        return ResponseEntity.ok(events);
    }

    /**
     * Get alert events by server ID
     */
    @GetMapping("/server/{serverId}")
    @Operation(summary = "Get Alert Events by Server ID", description = "Retrieve alert events occurring on a specific server")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert events retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class)))
    })
    public ResponseEntity<List<AlertEvent>> getAlertEventsByServerId(@PathVariable Long serverId) {
        List<AlertEvent> events = alertEventService.getAlertEventsByServerId(serverId);
        return ResponseEntity.ok(events);
    }

    /**
     * Get alert events by status
     */
    @GetMapping("/status/{status}")
    @Operation(summary = "Get Alert Events by Status", description = "Retrieve alert events by their status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert events retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class)))
    })
    public ResponseEntity<List<AlertEvent>> getAlertEventsByStatus(@PathVariable String status) {
        List<AlertEvent> events = alertEventService.getAlertEventsByStatus(status);
        return ResponseEntity.ok(events);
    }

    /**
     * Get alert events by time range
     */
    @GetMapping("/time-range")
    @Operation(summary = "Get Alert Events by Time Range", description = "Retrieve alert events that started within a specific time range")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert events retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "400", description = "Invalid date format", content = @Content)
    })
    public ResponseEntity<List<AlertEvent>> getAlertEventsByTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<AlertEvent> events = alertEventService.getAlertEventsByTimeRange(startTime, endTime);
        return ResponseEntity.ok(events);
    }

    /**
     * Mark an alert event as resolved
     */
    @PatchMapping("/{eventId}/resolve")
    @Operation(summary = "Resolve Alert Event", description = "Mark an alert event as resolved")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert event resolved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "404", description = "Alert event not found", content = @Content)
    })
    public ResponseEntity<AlertEvent> resolveAlertEvent(@PathVariable Long eventId) {
        try {
            AlertEvent resolvedEvent = alertEventService.resolveAlertEvent(eventId);
            return ResponseEntity.ok(resolvedEvent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get alert events with multiple filters
     */
    @GetMapping("/filtered")
    @Operation(summary = "Get Alert Events with Filters", description = "Retrieve alert events with multiple filter criteria")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alert events retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "400", description = "Invalid date format", content = @Content)
    })
    public ResponseEntity<List<AlertEvent>> getAlertEventsWithFilters(
            @RequestParam(required = false) Long ruleId,
            @RequestParam(required = false) Long serverId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<AlertEvent> events = alertEventService.getAlertEventsWithFilters(ruleId, serverId, status, startTime, endTime);
        return ResponseEntity.ok(events);
    }

    /**
     * Manually trigger an alert (for testing)
     */
    @PostMapping("/test-trigger")
    @Operation(summary = "Manually trigger an alert", description = "Create an alert event manually for testing")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Alert event created successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class))),
        @ApiResponse(responseCode = "400", description = "Invalid alert event data", content = @Content)
    })
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

    /**
     * Evaluate latest metrics for a server and create events if needed
     */
    @PostMapping("/evaluate")
    @Operation(summary = "Evaluate latest metrics for a server",
               description = "Evaluate the latest metrics and create alert events if rules are violated")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Evaluation done; list of triggered events",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlertEvent.class)))
    })
    public ResponseEntity<List<AlertEvent>> evaluate(@RequestParam("serverId") Long serverId) {
        List<AlertEvent> events = alertSystemService.evaluateMetrics(serverId);
        return ResponseEntity.ok(events);
    }
}
