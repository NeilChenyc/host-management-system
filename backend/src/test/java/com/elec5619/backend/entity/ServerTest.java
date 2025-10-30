package com.elec5619.backend.entity;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class ServerTest {
    @Test void testAllFieldsAndEdgeCases() {
        Server s = new Server();
        s.setId(8L);
        s.setServerName("web01");
        s.setIpAddress("127.0.0.1");
        s.setStatus(ServerStatus.online);
        s.setOperatingSystem("Linux");
        s.setCpu("8-core");
        s.setMemory("32GB");
        LocalDateTime now = LocalDateTime.now();
        s.setCreatedAt(now); s.setUpdatedAt(now); s.setLastUpdate(now);
        assertEquals(8L, s.getId());
        assertEquals("web01", s.getServerName());
        assertEquals("127.0.0.1", s.getIpAddress());
        assertEquals(ServerStatus.online, s.getStatus());
        assertEquals("Linux", s.getOperatingSystem());
        assertEquals("8-core", s.getCpu());
        assertEquals("32GB", s.getMemory());
        assertEquals(now, s.getCreatedAt());
        assertEquals(now, s.getUpdatedAt());
        assertEquals(now, s.getLastUpdate());
    }
    @Test void testNullAndDefaults() {
        Server s = new Server();
        assertNull(s.getId());
        assertNull(s.getServerName());
        assertEquals(ServerStatus.unknown, s.getStatus());
        s.setStatus(null); assertNull(s.getStatus());
    }
}
