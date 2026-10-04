package com.example.eventbooking.dto.request;

import jakarta.validation.constraints.*;

import com.example.eventbooking.model.EventModel;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 5000) String description,
        @NotNull EventModel.Category category,
        @NotBlank String location,
        @NotNull @Future LocalDateTime eventDate,
        @Min(1) int totalTickets,
        @NotNull @DecimalMin("0.00") BigDecimal price
) {}
