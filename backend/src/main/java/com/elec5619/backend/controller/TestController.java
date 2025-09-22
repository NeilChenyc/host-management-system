package com.elec5619.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Test controller for public endpoints.
 * Used to verify the application is running and accessible.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public")
public class TestController {
    
    /**
     * Public endpoint to test if the application is accessible.
     * 
     * @return success message
     */
    @GetMapping("/test")
    public String allAccess() {
        return "Public Content.";
    }
    
    /**
     * Health check endpoint.
     * 
     * @return application status
     */
    @GetMapping("/health")
    public String health() {
        return "Application is running successfully!";
    }
}
