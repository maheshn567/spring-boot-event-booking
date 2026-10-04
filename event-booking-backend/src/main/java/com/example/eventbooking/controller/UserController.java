package com.example.eventbooking.controller;

import com.example.eventbooking.dto.response.UserResponse;
import com.example.eventbooking.exception.ResourceNotFoundException;
import com.example.eventbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // Who am I? The UI calls this after login to get name + role.
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserDetails user) {
        return userRepository.findByEmail(user.getUsername())
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
