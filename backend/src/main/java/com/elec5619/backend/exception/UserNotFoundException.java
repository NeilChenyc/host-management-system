package com.elec5619.backend.exception;

/**
 * Exception thrown when attempting to access a user that does not exist.
 */
public class UserNotFoundException extends RuntimeException {
    
    public UserNotFoundException(String message) {
        super(message);
    }
    
    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
