package com.carenet.api.controller.auth;

import com.carenet.api.controller.auth.dto.AuthResponse;
import com.carenet.api.controller.auth.dto.LoginRequest;
import com.carenet.api.controller.auth.dto.RegisterRequest;
import com.carenet.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService auth;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) throws Exception {
        return ResponseEntity.ok(auth.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) throws Exception {
        return ResponseEntity.ok(auth.login(req));
    }
}
