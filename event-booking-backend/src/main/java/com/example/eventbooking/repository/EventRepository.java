package com.example.eventbooking.repository;

import com.example.eventbooking.model.EventModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.UUID;

public interface EventRepository extends JpaRepository<EventModel, UUID>,
        JpaSpecificationExecutor<EventModel> {

    long countByEventDateAfter(LocalDateTime date);

    @Query("select coalesce(sum(e.bookedTickets), 0) from EventModel e")
    long sumBookedTickets();
}
