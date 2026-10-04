package com.example.eventbooking.exception;

// 409 — clashes with existing data (email taken, sold out, already booked)
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
