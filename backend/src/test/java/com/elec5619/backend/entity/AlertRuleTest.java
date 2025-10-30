package com.elec5619.backend.entity;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class AlertRuleTest {
    @Test void testAllFieldsAndSetters() {
        AlertRule r = new AlertRule();
        r.setRuleId(100L);
        r.setRuleName("CPU Alert");
        r.setDescription("Warn if CPU > 90%");
        r.setTargetMetric("cpu_usage");
        r.setComparator(">=");
        r.setThreshold(90.5);
        r.setDuration(60);
        r.setSeverity("high");
        r.setEnabled(false);
        r.setScopeLevel("company");
        r.setServerId(6L);
        r.setTargetFilter("prod");
        LocalDateTime now = LocalDateTime.now();
        r.setCreatedAt(now); r.setUpdatedAt(now);
        assertEquals(100L, r.getRuleId());
        assertEquals("CPU Alert", r.getRuleName());
        assertEquals("Warn if CPU > 90%", r.getDescription());
        assertEquals("cpu_usage", r.getTargetMetric());
        assertEquals(">=", r.getComparator());
        assertEquals(90.5, r.getThreshold());
        assertEquals(60, r.getDuration());
        assertEquals("high", r.getSeverity());
        assertFalse(r.getEnabled());
        assertEquals("company", r.getScopeLevel());
        assertEquals(6L, r.getServerId());
        assertEquals("prod", r.getTargetFilter());
        assertEquals(now, r.getCreatedAt());
        assertEquals(now, r.getUpdatedAt());
    }
    @Test void testNullsAndEdge() {
        AlertRule r = new AlertRule();
        r.setComparator(null);
        assertNull(r.getComparator());
        r.setDescription(null);
        assertNull(r.getDescription());
        r.setThreshold(Double.MIN_VALUE);
        assertEquals(Double.MIN_VALUE, r.getThreshold());
    }
}
