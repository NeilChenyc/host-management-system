package com.elec5619.backend.service;

import com.elec5619.backend.dto.ProjectCreateDto;
import com.elec5619.backend.dto.ProjectUpdateDto;
import com.elec5619.backend.entity.Project;
import com.elec5619.backend.exception.ProjectNameAlreadyExistsException;
import com.elec5619.backend.exception.ServerNotFoundException;
import com.elec5619.backend.exception.UserNotFoundException;
import com.elec5619.backend.repository.AlertRuleRepository;
import com.elec5619.backend.repository.ProjectMemberRepository;
import com.elec5619.backend.repository.ProjectRepository;
import com.elec5619.backend.repository.ServerRepository;
import com.elec5619.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjectServiceTest {
    @Mock ProjectRepository projectRepository;
    @Mock ServerRepository serverRepository;
    @Mock UserRepository userRepository;
    @Mock ProjectMemberRepository projectMemberRepository;
    @Mock AlertRuleRepository alertRuleRepository;
    @InjectMocks ProjectService service;

    @BeforeEach void setUp() { MockitoAnnotations.openMocks(this); }

    @Test void create_duplicateNameThrows() {
        ProjectCreateDto dto = new ProjectCreateDto();
        dto.setProjectName("myProject");
        when(projectRepository.findByProjectName("myProject")).thenReturn(Optional.of(new Project()));
        assertThrows(ProjectNameAlreadyExistsException.class, () -> service.create(dto));
    }

    @Test void create_serverIdNotExistThrows() {
        ProjectCreateDto dto = new ProjectCreateDto();
        dto.setProjectName("newProject");
        dto.setServers(Set.of(1L));
        when(projectRepository.findByProjectName(any())).thenReturn(Optional.empty());
        when(serverRepository.existsById(1L)).thenReturn(false);
        assertThrows(ServerNotFoundException.class, () -> service.create(dto));
    }

    @Test void create_userIdNotExistThrows() {
        ProjectCreateDto dto = new ProjectCreateDto();
        dto.setProjectName("good");
        dto.setUserIds(Set.of(9L));
        when(projectRepository.findByProjectName(any())).thenReturn(Optional.empty());
        when(serverRepository.existsById(any())).thenReturn(true);
        when(userRepository.existsById(9L)).thenReturn(false);
        assertThrows(UserNotFoundException.class, () -> service.create(dto));
    }

    @Test void delete_projectNotExist_returnsFalse() {
        when(projectRepository.existsById(33L)).thenReturn(false);
        assertFalse(service.delete(33L));
    }

    @Test void update_projectExists_updatesAndReturns() {
        Project proj = new Project(); proj.setId(6L);
        ProjectUpdateDto dto = new ProjectUpdateDto();
        dto.setProjectName("U");
        when(projectRepository.findById(6L)).thenReturn(Optional.of(proj));
        when(projectRepository.save(any())).thenReturn(proj);
        var res = service.update(6L, dto);
        assertTrue(res.isPresent());
    }
    // TODO: Add tests for listAll, getById, getByName, listByStatus, updateStatus, addMembers, removeMembers, getProjectsByUserId, edge cases and null handling.
}
