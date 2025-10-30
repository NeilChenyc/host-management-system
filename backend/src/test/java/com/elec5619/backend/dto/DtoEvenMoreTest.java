package com.elec5619.backend.dto;

import com.elec5619.backend.entity.ServerStatus;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class DtoEvenMoreTest {

    private static Validator validator;

    @BeforeAll
    static void init() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void serverUpdateDto_accessors_and_validation() {
        ServerUpdateDto dto = new ServerUpdateDto();
        dto.setServerName("ab");
        dto.setIpAddress("1.2.3.4");
        dto.setOperatingSystem("Linux");
        dto.setCpu("i7");
        dto.setMemory("16G");
        dto.setStatus(ServerStatus.online);
        assertEquals("ab", dto.getServerName());
        assertEquals("1.2.3.4", dto.getIpAddress());
        assertEquals(ServerStatus.online, dto.getStatus());

        // too short name -> violation
        dto.setServerName("a");
        Set<ConstraintViolation<ServerUpdateDto>> v = validator.validate(dto);
        assertTrue(v.stream().anyMatch(x -> x.getPropertyPath().toString().equals("serverName")));
    }

    @Test
    void serverResponseDto_accessors() {
        ServerResponseDto dto = new ServerResponseDto();
        LocalDateTime now = LocalDateTime.now();
        dto.setId(1L);
        dto.setServerName("srv");
        dto.setIpAddress("1.1.1.1");
        dto.setStatus(ServerStatus.maintenance);
        dto.setOperatingSystem("Ubuntu");
        dto.setCpu("x");
        dto.setMemory("y");
        dto.setCreatedAt(now);
        dto.setUpdatedAt(now);

        assertEquals(1L, dto.getId());
        assertEquals("srv", dto.getServerName());
        assertEquals("1.1.1.1", dto.getIpAddress());
        assertEquals(ServerStatus.maintenance, dto.getStatus());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void serverOverviewDto_defaults_and_accessors() {
        ServerOverviewDto dto = new ServerOverviewDto();
        dto.setId(1L);
        dto.setHostname("h");
        dto.setIpAddress("i");
        dto.setStatus(ServerStatus.offline);
        dto.setCpuUsage(null);
        dto.setMemoryUsage(null);
        dto.setDiskUsage(null);
        dto.setNetworkUsage(null);
        dto.setTemperature(null);
        dto.setLoadAvg(null);
        dto.setAlertCount(null);
        assertEquals(0.0, dto.getCpuUsage());
        assertEquals(0.0, dto.getMemoryUsage());
        assertEquals(0.0, dto.getDiskUsage());
        assertEquals(0.0, dto.getNetworkUsage());
        assertEquals(0.0, dto.getTemperature());
        assertEquals(0.0, dto.getLoadAvg());
        assertEquals(0, dto.getAlertCount());
    }

    @Test
    void serverSummaryDto_accessors() {
        ServerSummaryDto dto = new ServerSummaryDto(1L, "s", "i");
        assertEquals(1L, dto.getId());
        assertEquals("s", dto.getServerName());
        assertEquals("i", dto.getIpAddress());
    }

    @Test
    void alertStatisticsDto_accessors_and_toString() {
        AlertStatisticsDTO dto = new AlertStatisticsDTO();
        dto.setTotalRules(1);
        dto.setActiveRules(2);
        dto.setTotalEvents(3);
        dto.setActiveEvents(4);
        dto.setResolvedEvents(5);
        dto.setRecentEvents(6);
        assertTrue(dto.toString().contains("totalRules"));
    }

    @Test
    void alertEventResponseDto_accessors() {
        AlertEventResponseDto dto = new AlertEventResponseDto();
        LocalDateTime now = LocalDateTime.now();
        dto.setEventId(1L);
        dto.setServerName("s");
        dto.setRuleName("r");
        dto.setStatus("firing");
        dto.setStartedAt(now);
        dto.setResolvedAt(now);
        dto.setTriggeredValue(1.2);
        dto.setSummary("sum");
        dto.setCreatedAt(now);
        assertEquals(1L, dto.getEventId());
        assertEquals("s", dto.getServerName());
        assertEquals("r", dto.getRuleName());
        assertEquals("firing", dto.getStatus());
        assertEquals(now, dto.getCreatedAt());
    }
}


