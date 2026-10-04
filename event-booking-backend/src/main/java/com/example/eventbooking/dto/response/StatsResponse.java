package com.example.eventbooking.dto.response;

import java.math.BigDecimal;

// Numbers for the admin overview
public record StatsResponse(
        long upcomingEvents,
        long ticketsSold,
        long activeBookings,
        BigDecimal revenue
) {}
