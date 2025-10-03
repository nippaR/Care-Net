package com.carenet.api.controller.auth.dto;
public record AuthResponse(String accessToken, String role, String userId, String email) {}
