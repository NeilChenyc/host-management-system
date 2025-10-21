package com.elec5619.backend.dto;

import com.elec5619.backend.entity.ServerStatus;

import jakarta.validation.constraints.Size;


public class ServerUpdateDto {

    @Size(min = 2, max = 100, message = "Server name must be between 2 and 100 characters")
    private String serverName;

    @Size(min = 1, max = 255, message = "IP address must be between 1 and 255 characters")
    private String ipAddress;

    private String operatingSystem;

    private String cpu;

    private String memory;

    private ServerStatus status;

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

    public String getOperatingSystem() {
        return operatingSystem;
    }

    public void setOperatingSystem(String operatingSystem) {
        this.operatingSystem = operatingSystem;
    }

    public String getCpu() {
        return cpu;
    }

    public void setCpu(String cpu) {
        this.cpu = cpu;
    }

    public String getMemory() {
        return memory;
    }

    public void setMemory(String memory) {
        this.memory = memory;
    }

    public ServerStatus getStatus() {
        return status;
    }

    public void setStatus(ServerStatus status) {
        this.status = status;
    }
}


