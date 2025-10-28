package com.elec5619.backend.dto;

import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object for alert statistics.
 * Contains aggregated information about alert rules and events.
 */
public class AlertStatisticsDTO {

    private int totalRules;
    private int activeRules;
    private int totalEvents;
    private int activeEvents;
    private int resolvedEvents;
    private int recentEvents;
    private Map<String, Integer> eventsBySeverity;
    private Map<String, Integer> eventsByRule;
    private List<String> recentAlerts;

    // Default constructor
    public AlertStatisticsDTO() {
    }

    // Getters and Setters
    public int getTotalRules() {
        return totalRules;
    }

    public void setTotalRules(int totalRules) {
        this.totalRules = totalRules;
    }

    public int getActiveRules() {
        return activeRules;
    }

    public void setActiveRules(int activeRules) {
        this.activeRules = activeRules;
    }

    public int getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(int totalEvents) {
        this.totalEvents = totalEvents;
    }

    public int getActiveEvents() {
        return activeEvents;
    }

    public void setActiveEvents(int activeEvents) {
        this.activeEvents = activeEvents;
    }

    public int getResolvedEvents() {
        return resolvedEvents;
    }

    public void setResolvedEvents(int resolvedEvents) {
        this.resolvedEvents = resolvedEvents;
    }

    public int getRecentEvents() {
        return recentEvents;
    }

    public void setRecentEvents(int recentEvents) {
        this.recentEvents = recentEvents;
    }

    public Map<String, Integer> getEventsBySeverity() {
        return eventsBySeverity;
    }

    public void setEventsBySeverity(Map<String, Integer> eventsBySeverity) {
        this.eventsBySeverity = eventsBySeverity;
    }

    public Map<String, Integer> getEventsByRule() {
        return eventsByRule;
    }

    public void setEventsByRule(Map<String, Integer> eventsByRule) {
        this.eventsByRule = eventsByRule;
    }

    public List<String> getRecentAlerts() {
        return recentAlerts;
    }

    public void setRecentAlerts(List<String> recentAlerts) {
        this.recentAlerts = recentAlerts;
    }

    @Override
    public String toString() {
        return "AlertStatisticsDTO{" +
                "totalRules=" + totalRules +
                ", activeRules=" + activeRules +
                ", totalEvents=" + totalEvents +
                ", activeEvents=" + activeEvents +
                ", resolvedEvents=" + resolvedEvents +
                ", recentEvents=" + recentEvents +
                "}";
    }
}