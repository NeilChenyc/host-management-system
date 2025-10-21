package com.elec5619.backend.exception;

/**
 * Exception thrown when attempting to create a server with a name that already exists.
 */
public class ServerNameAlreadyExistsException extends RuntimeException {
    
    public ServerNameAlreadyExistsException(String message) {
        super(message);
    }
    
    public ServerNameAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
