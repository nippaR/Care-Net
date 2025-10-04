package com.carenet.api.controller.profile;

import com.carenet.api.model.User;
import com.carenet.api.model.common.Role;
import com.carenet.api.repository.CareSeekerProfileRepository;
import com.carenet.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/careseekers")
public class CareSeekerDirectoryController {

    private final UserRepository users;
    private final CareSeekerProfileRepository profiles; // in case you want to enrich with profile data

    /**
     * Returns minimal rows for AdminPatients.jsx left table.
     * Frontend calls GET /api/careseekers/profile
     */
    @GetMapping("/profile")
    public List<Row> listCareseekers() {
        return users.findByRolesContaining(Role.CARE_SEEKER.name())
                .stream()
                .map(u -> new Row(
                        u.getId(),
                        safe(u.getFirstName()),
                        safe(u.getEmail()),
                        safe(u.getPhone()),
                        (u.getStatus() == null ? User.Status.ACTIVE : u.getStatus()).name()
                ))
                .toList();
    }

    private static String safe(String s) { return s == null ? "" : s; }

    public record Row(
            String id,
            String firstName,
            String email,
            String phone,
            String status // "ACTIVE" | "DEACTIVATED"
    ) {}
}
