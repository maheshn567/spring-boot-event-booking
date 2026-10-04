package com.example.eventbooking.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record BookingRequest(
        @NotNull UUID eventId
) {}
