package com.elec5619.backend.entity;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class AlertEventTest {
    @Test void testConstructorAndFields() {
        AlertEvent e = new AlertEvent();
        e.setEventId(500L);
        AlertRule rule = new AlertRule();
        e.setAlertRule(rule);
        e.setServerId(3L);
        e.setStatus("firing");
        LocalDateTime now = LocalDateTime.now();
        e.setStartedAt(now);
        e.setResolvedAt(now.plusMinutes(1));
        e.setTriggeredValue(98.6);
        e.setSummary("test event");
        e.setCreatedAt(now.minusDays(1));
        assertEquals(500L, e.getEventId());
        assertEquals(rule, e.getAlertRule());
        assertEquals(3L, e.getServerId());
        assertEquals("firing", e.getStatus());
        assertEquals(now, e.getStartedAt());
        assertEquals(now.plusMinutes(1), e.getResolvedAt());
        assertEquals(98.6, e.getTriggeredValue());
        assertEquals("test event", e.getSummary());
        assertEquals(now.minusDays(1), e.getCreatedAt());
    }
    @Test void testNullAndEdgeCases() {
        AlertEvent e = new AlertEvent();
        e.setTriggeredValue(Double.MAX_VALUE);
        assertEquals(Double.MAX_VALUE, e.getTriggeredValue());
        e.setAlertRule(null);
        assertNull(e.getAlertRule());
    }
}
