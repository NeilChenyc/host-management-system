package com.elec5619.backend.entity.converter;

import com.elec5619.backend.entity.ServerStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ServerStatusConverterTest {

    private final ServerStatusConverter converter = new ServerStatusConverter();

    @Test
    void convertToDatabaseColumn_coversAll() {
        assertNull(converter.convertToDatabaseColumn(null));
        assertEquals("online", converter.convertToDatabaseColumn(ServerStatus.online));
        assertEquals("offline", converter.convertToDatabaseColumn(ServerStatus.offline));
        assertEquals("maintenance", converter.convertToDatabaseColumn(ServerStatus.maintenance));
        assertEquals("unknown", converter.convertToDatabaseColumn(ServerStatus.unknown));
    }

    @Test
    void convertToEntityAttribute_coversSynonyms_defaultsUnknown() {
        assertEquals(ServerStatus.unknown, converter.convertToEntityAttribute(null));
        assertEquals(ServerStatus.online, converter.convertToEntityAttribute("online"));
        assertEquals(ServerStatus.online, converter.convertToEntityAttribute("UP"));
        assertEquals(ServerStatus.offline, converter.convertToEntityAttribute("offline"));
        assertEquals(ServerStatus.offline, converter.convertToEntityAttribute("down"));
        assertEquals(ServerStatus.maintenance, converter.convertToEntityAttribute("maintenance"));
        assertEquals(ServerStatus.unknown, converter.convertToEntityAttribute("unexpected"));
    }
}


