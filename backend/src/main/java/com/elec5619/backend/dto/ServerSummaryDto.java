package com.elec5619.backend.dto;

/**
 * Simplified server information for use in other DTOs
 */
public class ServerSummaryDto {
    
    private Long id;
    private String serverName;
    private String ipAddress;
    
    public ServerSummaryDto() {
    }
    
    public ServerSummaryDto(Long id, String serverName, String ipAddress) {
        this.id = id;
        this.serverName = serverName;
        this.ipAddress = ipAddress;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getServerName() {
        return serverName;
    }
    
    public void setServerName(String serverName) {
        this.serverName = serverName;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}

