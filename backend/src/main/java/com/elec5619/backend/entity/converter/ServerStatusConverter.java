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
            case UP -> "online";
            case DOWN -> "offline";
            case MAINTENANCE -> "maintenance";
            case UNKNOWN -> "unknown";
        };
    }

    @Override
    public ServerStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return ServerStatus.UNKNOWN;
        String normalized = dbData.trim().toLowerCase();
        return switch (normalized) {
            case "online", "up" -> ServerStatus.UP;
            case "offline", "down" -> ServerStatus.DOWN;
            case "maintenance" -> ServerStatus.MAINTENANCE;
            case "unknown" -> ServerStatus.UNKNOWN;
            default -> ServerStatus.UNKNOWN;
        };
    }
}


