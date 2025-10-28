package com.elec5619.backend.entity.converter;

import com.elec5619.backend.entity.ServerStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ServerStatusConverter implements AttributeConverter<ServerStatus, String> {

    @Override
    public String convertToDatabaseColumn(ServerStatus attribute) {
        if (attribute == null) return null;
        return switch (attribute) {
            case online -> "online";
            case offline -> "offline";
            case maintenance -> "maintenance";
            case unknown -> "unknown";
        };
    }

    @Override
    public ServerStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return ServerStatus.unknown;
        String normalized = dbData.trim().toLowerCase();
        return switch (normalized) {
            case "online", "up" -> ServerStatus.online;
            case "offline", "down" -> ServerStatus.offline;
            case "maintenance" -> ServerStatus.maintenance;
            case "unknown" -> ServerStatus.unknown;
            default -> ServerStatus.unknown;
        };
    }
}


