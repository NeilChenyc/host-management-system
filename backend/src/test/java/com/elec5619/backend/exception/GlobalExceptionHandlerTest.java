package com.elec5619.backend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleJwtCustomCodes_mapsTo401() {
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r1 = handler.handleJwtException(new CustomJwtException(CustomJwtException.MISSING_TOKEN, "m"));
        assertEquals(401, r1.getStatusCode().value());
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r2 = handler.handleJwtException(new CustomJwtException(CustomJwtException.INVALID_TOKEN, "m"));
        assertEquals(401, r2.getStatusCode().value());
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r3 = handler.handleJwtException(new CustomJwtException(CustomJwtException.TOKEN_EXPIRED, "m"));
        assertEquals(401, r3.getStatusCode().value());
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r4 = handler.handleJwtException(new CustomJwtException(CustomJwtException.TOKEN_PARSE_ERROR, "m"));
        assertEquals(401, r4.getStatusCode().value());
    }

    @Test
    void handleAccessDenied_friendlyMessages() {
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r = handler.handleAccessDeniedException(new AccessDeniedException("USER_MANAGE_ALL required"));
        assertEquals(403, r.getStatusCode().value());
        assertTrue(r.getBody().getMessage().toLowerCase().contains("user"));
    }

    @Test
    void handleDataIntegrity_branching() {
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r1 = handler.handleDataIntegrityViolationException(new DataIntegrityViolationException("server_name unique"));
        assertEquals(409, r1.getStatusCode().value());
        assertEquals(40901, r1.getBody().getCode());

        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r2 = handler.handleDataIntegrityViolationException(new DataIntegrityViolationException("unique constraint"));
        assertEquals(409, r2.getStatusCode().value());
        assertEquals(40902, r2.getBody().getCode());

        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r3 = handler.handleDataIntegrityViolationException(new DataIntegrityViolationException("other"));
        assertEquals(400, r3.getStatusCode().value());
        assertEquals(40004, r3.getBody().getCode());
    }

    @Test
    void handleIllegalArgument_badRequest() {
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r = handler.handleIllegalArgumentException(new IllegalArgumentException("bad"));
        assertEquals(400, r.getStatusCode().value());
        assertEquals("bad", r.getBody().getMessage());
    }

    @Test
    void handleGeneric_mapsTo500() {
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r = handler.handleGenericException(new Exception("x"));
        assertEquals(500, r.getStatusCode().value());
        assertEquals(50001, r.getBody().getCode());
    }

    @Test
    void handleCustomConflictExceptions() {
        assertEquals(409, handler.handleProjectNameAlreadyExistsException(new ProjectNameAlreadyExistsException("dup proj")).getStatusCode().value());
        assertEquals(404, handler.handleUserNotFoundException(new UserNotFoundException("not found u")).getStatusCode().value());
        assertEquals(404, handler.handleServerNotFoundException(new ServerNotFoundException("not found s")).getStatusCode().value());
        assertEquals(404, handler.handleProjectNotFoundException(new ProjectNotFoundException("not found p")).getStatusCode().value());
        assertEquals(409, handler.handleProjectMemberAlreadyExistsException(new ProjectMemberAlreadyExistsException("dup mem")).getStatusCode().value());
        assertEquals(409, handler.handleServerNameAlreadyExistsException(new ServerNameAlreadyExistsException("dup server")).getStatusCode().value());
    }

    @Test
    void handleNullPointerException_mapsTo500() {
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r = handler.handleNullPointerException(new NullPointerException("npe"));
        assertEquals(500, r.getStatusCode().value());
        assertEquals(50001, r.getBody().getCode());
    }

    @Test
    void handleTransactionSystem_unknownRootCause_mapsTo500() {
        // Root cause is not handled specially
        var txEx = new org.springframework.transaction.TransactionSystemException("tx", new RuntimeException("x"));
        ResponseEntity<GlobalExceptionHandler.ErrorResponse> r = handler.handleTransactionSystem(txEx);
        assertEquals(500, r.getStatusCode().value());
        assertEquals(50000, r.getBody().getCode());
    }
}


