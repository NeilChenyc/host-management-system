package com.elec5619.backend.exception;

/**
 * Exception thrown when attempting to access a server that does not exist.
 */
public class ServerNotFoundException extends RuntimeException {
    
    public ServerNotFoundException(String message) {
        super(message);
    }
    
    public ServerNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
