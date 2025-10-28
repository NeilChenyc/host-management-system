package com.elec5619.backend.exception;

public class ProjectMemberAlreadyExistsException extends RuntimeException {
    public ProjectMemberAlreadyExistsException(String message) {
        super(message);
    }
    
    public ProjectMemberAlreadyExistsException(Long projectId, Long userId) {
        super("User " + userId + " is already a member of project " + projectId);
    }
}
