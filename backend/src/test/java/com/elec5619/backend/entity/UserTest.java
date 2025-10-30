package com.elec5619.backend.entity;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;
import java.util.List;

class UserTest {
    @Test
    void testConstructorsGettersSetters() {
        User u = new User();
        u.setId(1L);
        u.setUsername("abc");
        u.setPasswordHash("x");
        u.setEmail("aaa@a.com");
        u.setCreatedAt(LocalDateTime.now());
        u.setRole("admin");
        assertEquals(1L, u.getId());
        assertEquals("abc", u.getUsername());
        assertEquals("x", u.getPasswordHash());
        assertEquals("aaa@a.com", u.getEmail());
        assertNotNull(u.getCreatedAt());
        assertEquals("admin", u.getRole());
        u.setProjectMembers(List.of());
        assertNotNull(u.getProjectMembers());
    }

    @Test
    void testRoleCheckEqualsToString() {
        User u = new User("test", "hash", "m@x.com");
        u.setId(10L);
        u.setRole("manager");
        assertTrue(u.hasRole("manager"));
        assertFalse(u.hasRole("admin"));
        String s = u.toString();
        assertTrue(s.contains("test"));
        assertTrue(s.contains("manager"));
        // equality contract (id only)
        User v = new User();
        v.setId(10L);
        assertNotEquals(u, v); // no equals overridden; just check instance
    }
}
