package com.example.eventbooking.exception;

// 400 — request makes no sense (e.g. cancel an already cancelled booking)
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
