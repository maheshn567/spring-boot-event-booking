package com.example.eventbooking.repository;

import com.example.eventbooking.model.BookingModel;
import com.example.eventbooking.model.EventModel;
import com.example.eventbooking.model.UserModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BookingRepository extends JpaRepository<BookingModel, UUID> {

    // Load the event in the same query (avoids 1 extra query per booking)
    @EntityGraph(attributePaths = "event")
    Page<BookingModel> findByUser(UserModel user, Pageable pageable);

    boolean existsByUserAndEventAndStatus(UserModel user, EventModel event,
                                          BookingModel.Status status);

    boolean existsByEvent(EventModel event);
}
