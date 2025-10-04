package com.carenet.api.controller.admin;

import com.carenet.api.model.User;
import com.carenet.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/caregivers")
public class AdminCareGiverController {

    private final UserRepository users;

    // PUT /api/admin/caregivers/{id}/status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody StatusBody body) {
        var u = users.findById(id).orElse(null);
        if (u == null) return ResponseEntity.notFound().build();
        if (body == null || body.status == null) return ResponseEntity.badRequest().body("Missing status");

        User.Status newStatus;
        try {
            newStatus = User.Status.valueOf(body.status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid status");
        }

        u.setStatus(newStatus);
        users.save(u);
        return ResponseEntity.ok().build();
    }

    public static class StatusBody {
        public String status; // "ACTIVE" | "DEACTIVATED"
    }
}
