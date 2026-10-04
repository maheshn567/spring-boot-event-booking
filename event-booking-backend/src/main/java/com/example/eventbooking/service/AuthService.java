package com.example.eventbooking.service;

import com.example.eventbooking.dto.request.LoginRequest;
import com.example.eventbooking.dto.request.RegisterRequest;
import com.example.eventbooking.dto.response.AuthResponse;
import com.example.eventbooking.dto.response.UserResponse;
import com.example.eventbooking.exception.ConflictException;
import com.example.eventbooking.model.UserModel;
import com.example.eventbooking.repository.UserRepository;
import com.example.eventbooking.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }

        UserModel user = UserModel.builder()
                .name(request.name().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password())) // store hash only
                .role(UserModel.Role.USER)                            // never trust client for role
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        // Checks email + password (BCrypt matches) for us.
        // Wrong credentials → BadCredentialsException → 401 via GlobalExceptionHandler
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        UserDetails user = (UserDetails) auth.getPrincipal();
        return new AuthResponse(jwtService.generateToken(user));
    }
}
