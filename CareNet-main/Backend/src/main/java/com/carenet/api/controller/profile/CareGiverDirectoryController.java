package com.carenet.api.controller.profile;

import com.carenet.api.model.User;
import com.carenet.api.model.common.Role;
import com.carenet.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/caregivers")
public class CareGiverDirectoryController {

        private final UserRepository users;

        // GET /api/caregivers/profile
        @GetMapping("/profile")
        public List<Row> listCaregivers() {
                return users.findByRolesContaining(Role.CAREGIVER.name())
                        .stream()
                        .map(u -> new Row(
                                u.getId(),
                                nz(u.getFirstName()),
                                nz(u.getEmail()),
                                nz(u.getPhone()),
                                ((u.getStatus() == null ? User.Status.ACTIVE : u.getStatus())).name()
                        ))
                        .toList();
        }

        private static String nz(String s) { return s == null ? "" : s; }

        public record Row(
                String id,
                String firstName,
                String email,
                String phone,
                String status
        ) {}
}
