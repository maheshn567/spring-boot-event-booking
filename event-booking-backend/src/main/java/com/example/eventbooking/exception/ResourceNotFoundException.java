package com.example.eventbooking.exception;

// 404 — user / event / booking not found
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
