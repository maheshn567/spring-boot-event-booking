package com.example.eventbooking.dto.response;

import com.example.eventbooking.model.BookingModel;

import java.time.LocalDateTime;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        UUID eventId,
        String eventTitle,
        BookingModel.Status status,
        LocalDateTime bookedAt
) {
    public static BookingResponse from(BookingModel booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getEvent().getId(),
                booking.getEvent().getTitle(),
                booking.getStatus(),
                booking.getBookedAt()
        );
    }
}
