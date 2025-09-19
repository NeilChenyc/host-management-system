package com.elec5619.backend.controller;

import com.elec5619.backend.entity.AlertEvent;
import com.elec5619.backend.exception.GlobalExceptionHandler;
import com.elec5619.backend.service.AlertEventService;
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

    @Autowired
    public AlertEventController(AlertEventService alertEventService) {
        this.alertEventService = alertEventService;
    }

    /**
     * Create a new alert event
     * @param alertEvent Alert event data
     * @return Created alert event
     */
    @PostMapping
    @Operation(
        summary = "Create Alert Event",
        description = "Create a new alert event record"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Alert event created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertEvent.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid alert event data",
            content = @Content
        )
    })
    public ResponseEntity<AlertEvent> createAlertEvent(@Valid @RequestBody AlertEvent alertEvent) {
        AlertEvent createdEvent = alertEventService.createAlertEvent(alertEvent);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    /**
     * Get all alert events
     * @return List of all alert events
     */
    @GetMapping
    @Operation(
        summary = "Get All Alert Events",
        description = "Retrieve a list of all alert events in the system"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert events retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertEvent.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content
        )
    })
    public ResponseEntity<?> getAllAlertEvents() {
        try {
            List<AlertEvent> events = alertEventService.getAllAlertEvents();
            // If events list is empty, return 200 with empty list
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            // Handle any exceptions
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
     * @param eventId ID of the alert event to retrieve
     * @return Alert event with the specified ID
     */
    @GetMapping("/{eventId}")
    @Operation(
        summary = "Get Alert Event by ID",
        description = "Retrieve an alert event by its ID"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert event retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertEvent.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Alert event not found",
            content = @Content
        )
    })
    public ResponseEntity<AlertEvent> getAlertEventById(@PathVariable Long eventId) {
        return alertEventService.getAlertEventById(eventId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Update an existing alert event
     * @param eventId ID of the alert event to update
     * @param alertEvent Updated alert event data
     * @return Updated alert event
     */
    @PutMapping("/{eventId}")
    @Operation(
        summary = "Update Alert Event",
        description = "Update an existing alert event with new data"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert event updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertEvent.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Alert event not found",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid alert event data",
            content = @Content
        )
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
     * @param eventId ID of the alert event to delete
     */
    @DeleteMapping("/{eventId}")
    @Operation(
        summary = "Delete Alert Event",
        description = "Delete an alert event by its ID"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "204",
            description = "Alert event deleted successfully",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Alert event not found",
            content = @Content
        )
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
     * @param ruleId ID of the rule to filter by
     * @return List of alert events triggered by the specified rule
     */
    @GetMapping("/rule/{ruleId}")
    @Operation(
        summary = "Get Alert Events by Rule ID",
        description = "Retrieve alert events triggered by a specific rule"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert events retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertEvent.class)
            )
        )
    })
    public ResponseEntity<List<AlertEvent>> getAlertEventsByRuleId(@PathVariable Long ruleId) {
        List<AlertEvent> events = alertEventService.getAlertEventsByRuleId(ruleId);
        return ResponseEntity.ok(events);
    }

    /**
     * Get alert events by server ID
     * @param serverId ID of the server to filter by
     * @return List of alert events occurring on the specified server
     */
    @GetMapping("/server/{serverId}")
    @Operation(
        summary = "Get Alert Events by Server ID",
        description = "Retrieve alert events occurring on a specific server"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert events retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertEvent.class)
            )
        )
    })
    public ResponseEntity<List<AlertEvent>> getAlertEventsByServerId(@PathVariable Long serverId) {
        List<AlertEvent> events = alertEventService.getAlertEventsByServerId(serverId);
        return ResponseEntity.ok(events);
    }

    /**
     * Get alert events by status
     * @param status Status to filter by (e.g., "firing", "resolved")
     * @return List of alert events with the specified status
     */
    @GetMapping("/status/{status}")
    @Operation(
        summary = "Get Alert Events by Status",
        description = "Retrieve alert events by their status"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert events retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertEvent.class)
            )
        )
    })
    public ResponseEntity<List<AlertEvent>> getAlertEventsByStatus(@PathVariable String status) {
        List<AlertEvent> events = alertEventService.getAlertEventsByStatus(status);
        return ResponseEntity.ok(events);
    }

    /**
     * Get alert events by time range
     * @param startTime Start of the time range (format: yyyy-MM-dd'T'HH:mm:ss)
     * @param endTime End of the time range (format: yyyy-MM-dd'T'HH:mm:ss)
     * @return List of alert events that started within the specified time range
     */
    @GetMapping("/time-range")
    @Operation(
        summary = "Get Alert Events by Time Range",
        description = "Retrieve alert events that started within a specific time range"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert events retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertEvent.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid date format",
            content = @Content
        )
    })
    public ResponseEntity<List<AlertEvent>> getAlertEventsByTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<AlertEvent> events = alertEventService.getAlertEventsByTimeRange(startTime, endTime);
        return ResponseEntity.ok(events);
    }

    /**
     * Mark an alert event as resolved
     * @param eventId ID of the alert event to resolve
     * @return Resolved alert event
     */
    @PatchMapping("/{eventId}/resolve")
    @Operation(
        summary = "Resolve Alert Event",
        description = "Mark an alert event as resolved"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert event resolved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertEvent.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Alert event not found",
            content = @Content
        )
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
     * @param ruleId Optional rule ID filter
     * @param serverId Optional server ID filter
     * @param status Optional status filter
     * @param startTime Optional start time filter
     * @param endTime Optional end time filter
     * @return List of alert events matching the filters
     */
    @GetMapping("/filtered")
    @Operation(
        summary = "Get Alert Events with Filters",
        description = "Retrieve alert events with multiple filter criteria"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Alert events retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AlertEvent.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid date format",
            content = @Content
        )
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
}