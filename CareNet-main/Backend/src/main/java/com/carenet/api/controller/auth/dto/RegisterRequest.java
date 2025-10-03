package com.carenet.api.controller.auth.dto;
import com.carenet.api.model.common.Role;
public record RegisterRequest(String firstName, String lastName, String email,
                              String password, String city, String address, Role role) {}
