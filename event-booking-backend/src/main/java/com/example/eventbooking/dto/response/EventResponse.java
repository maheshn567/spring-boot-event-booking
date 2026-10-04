package com.example.eventbooking.dto.response;

import com.example.eventbooking.model.EventModel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String title,
        String description,
        String location,
        LocalDateTime eventDate,
        int totalTickets,
        int availableTickets,
        BigDecimal price
) {
    public static EventResponse from(EventModel event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getLocation(),
                event.getEventDate(),
                event.getTotalTickets(),
                event.getAvailableTickets(),
                event.getPrice()
        );
    }
}
