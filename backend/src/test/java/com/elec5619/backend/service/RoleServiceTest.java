package com.elec5619.backend.service;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.entity.Project;
import com.elec5619.backend.entity.ProjectMember;
import com.elec5619.backend.entity.User;
import com.elec5619.backend.repository.ProjectMemberRepository;
import com.elec5619.backend.repository.ProjectRepository;
import com.elec5619.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoleServiceTest {
    @Mock UserRepository userRepository;
    @Mock ProjectRepository projectRepository;
    @Mock ProjectMemberRepository projectMemberRepository;
    @InjectMocks RoleService roleService;

    @BeforeEach void setUp() { MockitoAnnotations.openMocks(this); }

    @Test void hasPermission_knownRoleAndPermission() {
        User u = new User(); u.setId(1L); u.setRole(PermissionConstants.ROLE_ADMIN);
        when(userRepository.findById(1L)).thenReturn(Optional.of(u));
        assertTrue(roleService.hasPermission(1L, PermissionConstants.USER_MANAGE_ALL));
    }

    @Test void hasPermission_defaultToOperation() {
        when(userRepository.findById(8L)).thenReturn(Optional.empty());
        assertTrue(roleService.hasPermission(8L, PermissionConstants.PROJECT_READ_OWN));
    }

    @Test void getUserPermissions_forManager() {
        User u = new User(); u.setId(2L); u.setRole(PermissionConstants.ROLE_MANAGER);
        when(userRepository.findById(2L)).thenReturn(Optional.of(u));
        Set<String> perms = roleService.getUserPermissions(2L);
        assertTrue(perms.contains(PermissionConstants.SERVER_MANAGE_ALL));
    }

    @Test void canAccessProject_read_ownProject() {
        User u = new User(); u.setId(3L); u.setRole(PermissionConstants.ROLE_OPERATION);
        when(userRepository.findById(3L)).thenReturn(Optional.of(u));
        ProjectMember pm = mock(ProjectMember.class);
        when(projectMemberRepository.findByProjectIdAndUserId(123L, 3L)).thenReturn(Optional.of(pm));
        assertTrue(roleService.canAccessProject(3L, 123L, "read"));
    }

    @Test void canAccessProject_writeManagerProject() {
        User u = new User(); u.setId(4L); u.setRole(PermissionConstants.ROLE_MANAGER);
        when(userRepository.findById(4L)).thenReturn(Optional.of(u));
        assertTrue(roleService.canAccessProject(4L, 999L, "write"));
    }

    @Test void getAccessibleProjects_returnsProjectList() {
        User u = new User(); u.setId(5L); u.setRole(PermissionConstants.ROLE_ADMIN);
        when(userRepository.findById(5L)).thenReturn(Optional.of(u));
        List<Project> projects = List.of(new Project());
        when(projectRepository.findAll()).thenReturn(projects);
        assertEquals(1, roleService.getAccessibleProjects(5L).size());
    }
    // TODO: Add tests for negative/edge cases and private helpers (isProjectOwner) if needed
}
