package com.example.eventbooking.dto.response;

import com.example.eventbooking.model.UserModel;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        UserModel.Role role
) {
    public static UserResponse from(UserModel user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
