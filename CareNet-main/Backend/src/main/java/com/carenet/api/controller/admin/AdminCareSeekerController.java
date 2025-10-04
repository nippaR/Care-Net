package com.carenet.api.controller.admin;

import com.carenet.api.model.User;
import com.carenet.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/careseekers")
public class AdminCareSeekerController {

    private final UserRepository users;

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody StatusBody body) {
        var u = users.findById(id).orElse(null);
        if (u == null) return ResponseEntity.notFound().build();
        if (body == null || body.status == null) return ResponseEntity.badRequest().body("Missing status");

        // validate + apply
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

    // incoming payload: { "status": "ACTIVE" | "DEACTIVATED" }
    public static class StatusBody {
        public String status;
    }
}
