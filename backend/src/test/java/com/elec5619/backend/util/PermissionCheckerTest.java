package com.elec5619.backend.util;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import com.elec5619.backend.constants.PermissionConstants;
import com.elec5619.backend.service.RoleService;

public class PermissionCheckerTest {

    private PermissionChecker permissionChecker;
    private RoleService roleService;

    @BeforeEach
    void setUp() throws Exception {
        permissionChecker = new PermissionChecker();
        roleService = mock(RoleService.class);
        // Inject mock via reflection
        var field = PermissionChecker.class.getDeclaredField("roleService");
        field.setAccessible(true);
        field.set(permissionChecker, roleService);
    }

    @Test
    void checkPermission_delegatesToRoleService() {
        when(roleService.hasPermission(1L, "X")).thenReturn(true);
        assertTrue(permissionChecker.checkPermission(1L, "X"));
        verify(roleService).hasPermission(1L, "X");
    }

    @Test
    void requirePermission_throwsWhenMissing() {
        when(roleService.hasPermission(2L, "Y")).thenReturn(false);
        assertThrows(AccessDeniedException.class, () -> permissionChecker.requirePermission(2L, "Y"));
    }

    @Test
    void checkProjectAccess_delegatesToRoleService() {
        when(roleService.canAccessProject(3L, 10L, "read")).thenReturn(true);
        assertTrue(permissionChecker.checkProjectAccess(3L, 10L, "read"));
        verify(roleService).canAccessProject(3L, 10L, "read");
    }

    @Test
    void requireProjectAccess_throwsWhenMissing() {
        when(roleService.canAccessProject(4L, 11L, "write")).thenReturn(false);
        assertThrows(AccessDeniedException.class, () -> permissionChecker.requireProjectAccess(4L, 11L, "write"));
    }

    @Test
    void isAdmin_checksSystemManageAll() {
        when(roleService.hasPermission(5L, PermissionConstants.SYSTEM_MANAGE_ALL)).thenReturn(true);
        assertTrue(permissionChecker.isAdmin(5L));
    }

    @Test
    void requireAdmin_throwsWhenNotAdmin() {
        when(roleService.hasPermission(6L, PermissionConstants.SYSTEM_MANAGE_ALL)).thenReturn(false);
        assertThrows(AccessDeniedException.class, () -> permissionChecker.requireAdmin(6L));
    }

    @Test
    void isManager_and_isOperator_delegate() {
        when(roleService.hasPermission(7L, PermissionConstants.PROJECT_READ_COMPANY)).thenReturn(true);
        when(roleService.hasPermission(8L, PermissionConstants.PROJECT_READ_OWN)).thenReturn(true);
        assertTrue(permissionChecker.isManager(7L));
        assertTrue(permissionChecker.isOperator(8L));
    }
}


