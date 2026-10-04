package com.example.eventbooking.service;

import com.example.eventbooking.dto.response.BookingResponse;
import com.example.eventbooking.exception.BadRequestException;
import com.example.eventbooking.exception.ConflictException;
import com.example.eventbooking.exception.ResourceNotFoundException;
import com.example.eventbooking.model.BookingModel;
import com.example.eventbooking.model.EventModel;
import com.example.eventbooking.model.UserModel;
import com.example.eventbooking.repository.BookingRepository;
import com.example.eventbooking.repository.EventRepository;
import com.example.eventbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    // If two people grab the last ticket at the same time, both read the event with
    // the same @Version. The first commit wins; the second fails at commit with
    // ObjectOptimisticLockingFailureException → GlobalExceptionHandler returns 409.
    @Transactional
    public BookingResponse book(UUID eventId, String email) {
        UserModel user = findUser(email);
        EventModel event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Event has already started");
        }
        if (event.getAvailableTickets() <= 0) {
            throw new ConflictException("Event is sold out");
        }
        if (bookingRepository.existsByUserAndEventAndStatus(user, event, BookingModel.Status.CONFIRMED)) {
            throw new ConflictException("You already booked this event");
        }

        event.setBookedTickets(event.getBookedTickets() + 1); // bumps event version on commit

        BookingModel booking = BookingModel.builder()
                .user(user)
                .event(event)
                .build(); // status → CONFIRMED in @PrePersist

        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> myBookings(String email, Pageable pageable) {
        return bookingRepository.findByUser(findUser(email), pageable)
                .map(BookingResponse::from);
    }

    @Transactional(readOnly = true)
    public BookingResponse getById(UUID bookingId, UserDetails currentUser) {
        return BookingResponse.from(findOwnedBooking(bookingId, currentUser));
    }

    @Transactional
    public BookingResponse cancel(UUID bookingId, UserDetails currentUser) {
        BookingModel booking = findOwnedBooking(bookingId, currentUser);
        EventModel event = booking.getEvent();

        if (booking.getStatus() == BookingModel.Status.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }
        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot cancel after the event has started");
        }

        booking.setStatus(BookingModel.Status.CANCELLED);
        event.setBookedTickets(event.getBookedTickets() - 1); // give the ticket back

        return BookingResponse.from(booking); // managed entities → saved on commit
    }

    // ── helpers ───────────────────────────────────────────────────

    private UserModel findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // Owner or ADMIN only
    private BookingModel findOwnedBooking(UUID bookingId, UserDetails currentUser) {
        BookingModel booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isOwner = booking.getUser().getEmail().equals(currentUser.getUsername());
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Not your booking");
        }
        return booking;
    }
}
