package com.elec5619.backend.service;

import com.elec5619.backend.dto.ServerCreateDto;
import com.elec5619.backend.dto.ServerResponseDto;
import com.elec5619.backend.dto.ServerUpdateDto;
import com.elec5619.backend.entity.Server;
import com.elec5619.backend.entity.ServerStatus;
import com.elec5619.backend.exception.ServerNameAlreadyExistsException;
import com.elec5619.backend.repository.ServerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ServerServiceTest {
    @Mock ServerRepository serverRepository;
    @Mock ServerMetricsService serverMetricsService;
    @Mock AlertEventService alertEventService;
    @InjectMocks ServerService serverService;

    @BeforeEach void setUp() { MockitoAnnotations.openMocks(this); }

    @Test void create_duplicateName_throwsException() {
        ServerCreateDto dto = new ServerCreateDto();
        dto.setServerName("server1");
        when(serverRepository.findByServerName("server1")).thenReturn(Optional.of(new Server()));
        assertThrows(ServerNameAlreadyExistsException.class, () -> serverService.create(dto));
    }

    @Test void create_normal_success() {
        ServerCreateDto dto = new ServerCreateDto();
        dto.setServerName("serverX");
        dto.setStatus(ServerStatus.online);
        when(serverRepository.findByServerName("serverX")).thenReturn(Optional.empty());
        when(serverRepository.save(any())).thenAnswer(inv-> {
            Server s = inv.getArgument(0);
            s.setId(1L);
            return s;
        });
        ServerResponseDto resp = serverService.create(dto);
        assertNotNull(resp);
        assertEquals("serverX", resp.getServerName());
    }

    @Test void update_nonexistent_returnsEmpty() {
        when(serverRepository.findById(11L)).thenReturn(Optional.empty());
        ServerUpdateDto dto = new ServerUpdateDto();
        assertTrue(serverService.update(11L, dto).isEmpty());
    }

    @Test void delete_ifNotExists_returnsFalse() {
        when(serverRepository.existsById(20L)).thenReturn(false);
        assertFalse(serverService.delete(20L));
    }

    @Test void updateStatus_ifExists_success() {
        Server srv = new Server(); srv.setId(5L); srv.setStatus(ServerStatus.unknown);
        when(serverRepository.findById(5L)).thenReturn(Optional.of(srv));
        when(serverRepository.save(any())).thenReturn(srv);
        Optional<ServerResponseDto> result = serverService.updateStatus(5L, ServerStatus.online);
        assertTrue(result.isPresent());
        assertEquals(ServerStatus.online, result.get().getStatus());
    }
    // TODO: Add more methods for full code coverage: getById, getByName, listAll, listByStatus, getServersOverview, update with DTO, toOverview
}
