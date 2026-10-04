package com.example.eventbooking.controller;

import com.example.eventbooking.dto.request.BookingRequest;
import com.example.eventbooking.dto.response.BookingResponse;
import com.example.eventbooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// All endpoints need a logged-in user (SecurityConfig: anyRequest().authenticated())
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse book(@Valid @RequestBody BookingRequest request,
                                @AuthenticationPrincipal UserDetails user) {
        return bookingService.book(request.eventId(), user.getUsername());
    }

    // My bookings, newest first
    @GetMapping
    public PagedModel<BookingResponse> myBookings(
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 10, sort = "bookedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return new PagedModel<>(bookingService.myBookings(user.getUsername(), pageable));
    }

    @GetMapping("/{id}")
    public BookingResponse getById(@PathVariable UUID id, @AuthenticationPrincipal UserDetails user) {
        return bookingService.getById(id, user.getUsername());
    }

    @PatchMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable UUID id, @AuthenticationPrincipal UserDetails user) {
        return bookingService.cancel(id, user.getUsername());
    }
}
