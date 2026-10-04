package com.example.eventbooking.repository;

import com.example.eventbooking.model.EventModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface EventRepository extends JpaRepository<EventModel, UUID>,
        JpaSpecificationExecutor<EventModel> {
}
