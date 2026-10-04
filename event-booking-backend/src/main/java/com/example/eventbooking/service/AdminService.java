package com.example.eventbooking.service;

import com.example.eventbooking.dto.response.BookingResponse;
import com.example.eventbooking.dto.response.StatsResponse;
import com.example.eventbooking.model.BookingModel;
import com.example.eventbooking.repository.BookingRepository;
import com.example.eventbooking.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public Page<BookingResponse> allBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable).map(BookingResponse::from);
    }

    @Transactional(readOnly = true)
    public StatsResponse stats() {
        return new StatsResponse(
                eventRepository.countByEventDateAfter(LocalDateTime.now()),
                eventRepository.sumBookedTickets(),
                bookingRepository.countByStatus(BookingModel.Status.CONFIRMED),
                bookingRepository.sumPriceByStatus(BookingModel.Status.CONFIRMED)
        );
    }
}
