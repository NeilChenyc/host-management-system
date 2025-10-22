package com.elec5619.backend.dto;

import com.elec5619.backend.entity.ServerStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Data Transfer Object for creating a new server")
public class ServerCreateDto {

    @NotBlank(message = "Server name is required")
    @Size(min = 2, max = 100, message = "Server name must be between 2 and 100 characters")
    @Schema(description = "Unique name for the server", example = "web-server-01", required = true)
    private String serverName;

    @NotBlank(message = "IP address is required")
    @Size(min = 1, max = 255, message = "IP address must be between 1 and 255 characters")
    @Schema(description = "IP address of the server", example = "192.168.1.100", required = true)
    private String ipAddress;

    @Schema(description = "Operating system of the server", example = "Ubuntu 22.04 LTS")
    private String operatingSystem;

    @Schema(description = "CPU specifications", example = "Intel Xeon E5-2680 v4")
    private String cpu;

    @Schema(description = "Memory specifications", example = "32GB DDR4")
    private String memory;

    @Schema(description = "Server status", allowableValues = {"online", "offline", "maintenance", "unknown"}, example = "unknown")
    private ServerStatus status;

    public String getServerName() {
        return serverName;
    }

    public ServerStatus getStatus() {
        return status;
    }

    public void setStatus(ServerStatus status) {
        this.status = status;
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
}


