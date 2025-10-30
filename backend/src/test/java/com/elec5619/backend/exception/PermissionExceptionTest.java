package com.elec5619.backend.exception;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PermissionExceptionTest {
    @Test
    void testConstructorAndCodes() {
        PermissionException e1 = new PermissionException(40301, "msg1");
        assertEquals(40301, e1.getCode());
        assertEquals("msg1", e1.getMessage());
        PermissionException e2 = new PermissionException(40302, "msg2", new RuntimeException("x"));
        assertEquals(40302, e2.getCode());
        assertTrue(e2.getMessage().contains("msg2"));
        assertNotNull(e2.getCause());
    }
    @Test
    void testStaticFactories() {
        PermissionException e1 = PermissionException.accessDenied();
        assertEquals(40301, e1.getCode());
        assertTrue(e1.getMessage().contains("Access denied"));
        PermissionException e2 = PermissionException.insufficientPermissions("USER_MANAGE_ALL");
        assertEquals(40302, e2.getCode());
        assertTrue(e2.getMessage().contains("USER_MANAGE_ALL"));
        PermissionException e3 = PermissionException.roleNotAllowed("guest");
        assertEquals(40303, e3.getCode());
        assertTrue(e3.getMessage().contains("guest"));
    }
}
