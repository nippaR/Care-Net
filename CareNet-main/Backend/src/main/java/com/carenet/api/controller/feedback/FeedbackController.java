package com.carenet.api.controller.feedback;

import com.carenet.api.model.feedback.Feedback;
import com.carenet.api.repository.FeedbackRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackRepository repo;

    /** Public create endpoint (no auth needed). Add auth if you prefer. */
    @PostMapping
    public ResponseEntity<Feedback> create(@Valid @RequestBody Feedback body) {
        // set server-side timestamp to be safe
        body.setCreatedAt(Instant.now());
        return ResponseEntity.ok(repo.save(body));
    }

    /** Admin/list endpoint — protect with auth/roles in production */
    @GetMapping
    public List<Feedback> list() {
        return repo.findAll();
    }
}
