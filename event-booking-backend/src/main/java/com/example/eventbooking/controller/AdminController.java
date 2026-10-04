package com.example.eventbooking.controller;

import com.example.eventbooking.dto.request.EventRequest;
import com.example.eventbooking.dto.response.BookingResponse;
import com.example.eventbooking.dto.response.EventResponse;
import com.example.eventbooking.dto.response.StatsResponse;
import com.example.eventbooking.service.AdminService;
import com.example.eventbooking.service.BookingService;
import com.example.eventbooking.service.EventService;
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

// Everything the organizer console uses. ADMIN only (enforced in SecurityConfig).
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final EventService eventService;
    private final BookingService bookingService;

    @GetMapping("/stats")
    public StatsResponse stats() {
        return adminService.stats();
    }

    // ── Events ────────────────────────────────────────────────────

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(@Valid @RequestBody EventRequest request,
                                     @AuthenticationPrincipal UserDetails admin) {
        return eventService.create(request, admin.getUsername());
    }

    @PutMapping("/events/{id}")
    public EventResponse updateEvent(@PathVariable UUID id, @Valid @RequestBody EventRequest request) {
        return eventService.update(id, request);
    }

    @DeleteMapping("/events/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(@PathVariable UUID id) {
        eventService.delete(id);
    }

    // ── Bookings ──────────────────────────────────────────────────

    @GetMapping("/bookings")
    public PagedModel<BookingResponse> allBookings(
            @PageableDefault(size = 20, sort = "bookedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return new PagedModel<>(adminService.allBookings(pageable));
    }

    @PatchMapping("/bookings/{id}/cancel")
    public BookingResponse cancelBooking(@PathVariable UUID id) {
        return bookingService.cancelAsAdmin(id);
    }
}
