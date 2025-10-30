package com.elec5619.backend.exception;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class BusinessExceptionTest {
    @Test void testBaseConstructor() {
        BusinessException e = new BusinessException(20001, "message");
        assertEquals(20001, e.getCode());
        assertEquals("message", e.getMessage());
    }
    @Test void testFullConstructorAndCause() {
        Throwable t = new RuntimeException("r");
        BusinessException e = new BusinessException(30001, "xx", t);
        assertEquals(30001, e.getCode());
        assertEquals("xx", e.getMessage());
        assertEquals(t, e.getCause());
    }
}
