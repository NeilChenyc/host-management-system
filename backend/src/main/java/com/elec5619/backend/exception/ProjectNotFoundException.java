package com.elec5619.backend.exception;

public class ProjectNotFoundException extends RuntimeException {
    public ProjectNotFoundException(String message) {
        super(message);
    }
    
    public ProjectNotFoundException(Long projectId) {
        super("Project not found with id: " + projectId);
    }
}
