package com.example.eventbooking.dto.response;

import com.example.eventbooking.model.BookingModel;
import com.example.eventbooking.model.EventModel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

// Touches lazy event/user → build inside a @Transactional method
public record BookingResponse(
        UUID id,
        UUID eventId,
        String eventTitle,
        String eventLocation,
        LocalDateTime eventDate,
        BigDecimal eventPrice,
        String userEmail,
        BookingModel.Status status,
        LocalDateTime bookedAt
) {
    public static BookingResponse from(BookingModel booking) {
        EventModel event = booking.getEvent();
        return new BookingResponse(
                booking.getId(),
                event.getId(),
                event.getTitle(),
                event.getLocation(),
                event.getEventDate(),
                event.getPrice(),
                booking.getUser().getEmail(),
                booking.getStatus(),
                booking.getBookedAt()
        );
    }
}
