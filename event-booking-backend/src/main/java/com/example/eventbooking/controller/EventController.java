package com.example.eventbooking.controller;

import com.example.eventbooking.dto.response.EventResponse;
import com.example.eventbooking.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

// Public, read-only. Creating / editing / deleting lives in AdminController.
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // GET /api/events?location=pune&from=2026-11-01T00:00:00&page=0&size=10
    @GetMapping
    public PagedModel<EventResponse> search(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @PageableDefault(size = 10, sort = "eventDate", direction = Sort.Direction.ASC) Pageable pageable) {
        return new PagedModel<>(eventService.search(location, from, to, pageable));
    }

    @GetMapping("/{id}")
    public EventResponse getById(@PathVariable UUID id) {
        return eventService.getById(id);
    }
}
