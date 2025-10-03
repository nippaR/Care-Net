package com.carenet.api.service;

import com.carenet.api.controller.auth.dto.AuthResponse;
import com.carenet.api.controller.auth.dto.LoginRequest;
import com.carenet.api.controller.auth.dto.RegisterRequest;
import com.carenet.api.model.User;
import com.carenet.api.model.common.Role;
import com.carenet.api.repository.UserRepository;
import com.carenet.api.config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthResponse register(RegisterRequest r) throws Exception {
        if (users.findByEmail(r.email()).isPresent()) throw new RuntimeException("Email already registered");
        User u = new User();
        u.setFirstName(r.firstName());
        u.setLastName(r.lastName());
        u.setEmail(r.email());
        u.setCity(r.city());
        u.setAddress(r.address());
        u.setPasswordHash(encoder.encode(r.password()));
        u.setRoles(Set.of(r.role() == null ? Role.CARE_SEEKER : r.role()));
        users.save(u);

        String role = u.getRoles().iterator().next().name();
        String token = jwt.create(Map.of("sub", u.getId(), "email", u.getEmail(), "roles", u.getRoles()));
        return new AuthResponse(token, role, u.getId(), u.getEmail());
    }

    public AuthResponse login(LoginRequest r) throws Exception {
        User u = users.findByEmail(r.email()).orElseThrow(() -> new RuntimeException("Invalid email or password"));
        if (!encoder.matches(r.password(), u.getPasswordHash())) throw new RuntimeException("Invalid email or password");

        String role = u.getRoles().iterator().next().name();
        String token = jwt.create(Map.of("sub", u.getId(), "email", u.getEmail(), "roles", u.getRoles()));
        return new AuthResponse(token, role, u.getId(), u.getEmail());
    }
}
