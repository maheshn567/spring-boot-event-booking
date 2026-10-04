package com.example.eventbooking.service;

import com.example.eventbooking.dto.request.EventRequest;
import com.example.eventbooking.dto.response.EventResponse;
import com.example.eventbooking.exception.BadRequestException;
import com.example.eventbooking.exception.ConflictException;
import com.example.eventbooking.exception.ResourceNotFoundException;
import com.example.eventbooking.model.EventModel;
import com.example.eventbooking.model.UserModel;
import com.example.eventbooking.repository.BookingRepository;
import com.example.eventbooking.repository.EventRepository;
import com.example.eventbooking.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public Page<EventResponse> search(String location, LocalDateTime from, LocalDateTime to,
                                      Pageable pageable) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new BadRequestException("'from' must be before 'to'");
        }
        return eventRepository.findAll(filter(location, from, to), pageable)
                .map(EventResponse::from);
    }

    @Transactional(readOnly = true)
    public EventResponse getById(UUID id) {
        return EventResponse.from(findEvent(id));
    }

    @Transactional
    public EventResponse create(EventRequest request, String adminEmail) {
        UserModel admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EventModel event = EventModel.builder()
                .createdBy(admin)
                .build();
        applyRequest(event, request);

        return EventResponse.from(eventRepository.save(event));
    }

    @Transactional
    public EventResponse update(UUID id, EventRequest request) {
        EventModel event = findEvent(id);

        // Can't shrink below what's already sold
        if (request.totalTickets() < event.getBookedTickets()) {
            throw new BadRequestException(
                    "totalTickets cannot be less than booked tickets (" + event.getBookedTickets() + ")");
        }
        applyRequest(event, request);

        return EventResponse.from(event); // managed entity → saved on commit
    }

    @Transactional
    public void delete(UUID id) {
        EventModel event = findEvent(id);

        // Bookings point at this event, so deleting it would break them
        if (bookingRepository.existsByEvent(event)) {
            throw new ConflictException("Event has bookings and cannot be deleted");
        }
        eventRepository.delete(event);
    }

    // ── helpers ───────────────────────────────────────────────────

    private EventModel findEvent(UUID id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }

    private void applyRequest(EventModel event, EventRequest request) {
        event.setTitle(request.title().trim());
        event.setDescription(request.description());
        event.setLocation(request.location().trim());
        event.setEventDate(request.eventDate());
        event.setTotalTickets(request.totalTickets());
        event.setPrice(request.price());
    }

    // Builds the WHERE clause from whichever filters were given (like a dynamic Prisma `where`)
    private static Specification<EventModel> filter(String location, LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            List<Predicate> rules = new ArrayList<>();
            if (location != null && !location.isBlank()) {
                rules.add(cb.like(cb.lower(root.get("location")),
                        "%" + location.trim().toLowerCase() + "%"));
            }
            if (from != null) {
                rules.add(cb.greaterThanOrEqualTo(root.get("eventDate"), from));
            }
            if (to != null) {
                rules.add(cb.lessThanOrEqualTo(root.get("eventDate"), to));
            }
            return cb.and(rules.toArray(new Predicate[0]));
        };
    }
}
