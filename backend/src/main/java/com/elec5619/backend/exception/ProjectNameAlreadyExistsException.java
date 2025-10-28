package com.elec5619.backend.exception;

/**
 * Exception thrown when attempting to create a project with a name that already exists.
 */
public class ProjectNameAlreadyExistsException extends RuntimeException {
    
    public ProjectNameAlreadyExistsException(String message) {
        super(message);
    }
    
    public ProjectNameAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
