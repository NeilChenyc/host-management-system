package com.elec5619.backend.constants;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PermissionConstantsTest {
    @Test
    void testConstantsNonNull() {
        assertNotNull(PermissionConstants.PROJECT_READ_OWN);
        assertNotNull(PermissionConstants.PROJECT_WRITE_OWN);
        assertNotNull(PermissionConstants.PROJECT_READ_COMPANY);
        assertNotNull(PermissionConstants.PROJECT_READ_ALL);
        assertNotNull(PermissionConstants.PROJECT_WRITE_ALL);
        assertNotNull(PermissionConstants.USER_READ_ALL);
        assertNotNull(PermissionConstants.USER_MANAGE_ALL);
        assertNotNull(PermissionConstants.SERVER_READ_ALL);
        assertNotNull(PermissionConstants.SERVER_MANAGE_ALL);
        assertNotNull(PermissionConstants.ALERT_READ_ALL);
        assertNotNull(PermissionConstants.ALERT_MANAGE_ALL);
        assertNotNull(PermissionConstants.SYSTEM_MANAGE_ALL);
        assertEquals("operation", PermissionConstants.ROLE_OPERATION);
        assertEquals("manager", PermissionConstants.ROLE_MANAGER);
        assertEquals("admin", PermissionConstants.ROLE_ADMIN);
    }
}
