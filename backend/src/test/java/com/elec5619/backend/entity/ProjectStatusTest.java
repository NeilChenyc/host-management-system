package com.elec5619.backend.entity;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ProjectStatusTest {
    @Test
    void testAllEnumValues() {
        for (ProjectStatus status : ProjectStatus.values()) {
            assertNotNull(status);
            assertNotNull(status.name());
        }
        assertEquals(ProjectStatus.ACTIVE, ProjectStatus.valueOf("ACTIVE"));
        assertEquals("ACTIVE", ProjectStatus.ACTIVE.name());
    }
}
