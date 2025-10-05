// [file name]: FeedbackController.java (Updated)
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

    /** Public create endpoint */
    @PostMapping
    public ResponseEntity<Feedback> create(@Valid @RequestBody Feedback body) {
        body.setCreatedAt(Instant.now());
        return ResponseEntity.ok(repo.save(body));
    }

    /** Get user's own feedback */
    @GetMapping("/my-feedback")
    public List<Feedback> getMyFeedback(@RequestParam String email) {
        return repo.findByEmailOrderByCreatedAtDesc(email);
    }

    /** Get specific feedback by ID (with email verification) */
    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getById(@PathVariable String id, @RequestParam String email) {
        return repo.findByIdAndEmail(id, email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Update feedback (only if user owns it) */
    @PutMapping("/{id}")
    public ResponseEntity<Feedback> update(
            @PathVariable String id,
            @RequestParam String email,
            @Valid @RequestBody Feedback updatedFeedback) {
        
        return repo.findByIdAndEmail(id, email)
                .map(existing -> {
                    existing.setNotes(updatedFeedback.getNotes());
                    existing.setQuality(updatedFeedback.getQuality());
                    existing.setSupport(updatedFeedback.getSupport());
                    existing.setUseful(updatedFeedback.getUseful());
                    existing.setMissing(updatedFeedback.getMissing());
                    existing.setUpdatedAt(Instant.now());
                    return ResponseEntity.ok(repo.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Admin/list endpoint — protect with auth/roles in production */
    @GetMapping
    public List<Feedback> list() {
        return repo.findAll();
    }
}