package com.carenet.api.controller.admin;

import com.carenet.api.model.feedback.Feedback;
import com.carenet.api.repository.FeedbackRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/feedback")
public class AdminFeedbackController {

    private final FeedbackRepository feedbacks;

    /* ========= LIST (used by the table) ========= */
    @GetMapping
    public ResponseEntity<List<FeedbackRowDTO>> list() {
        List<FeedbackRowDTO> out = feedbacks.findAll()
                .stream()
                .sorted(Comparator.comparing(Feedback::getCreatedAt).reversed())
                .map(AdminFeedbackController::toRow)
                .collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    /* ========= SUMMARY (cards + bars) ========= */
    @GetMapping("/summary")
    public ResponseEntity<FeedbackSummaryDTO> summary() {
        List<Feedback> all = feedbacks.findAll();
        int total = all.size();

        // round average(quality, support) to nearest star (1..5) for the breakdown
        Map<Integer, Long> byStars = new HashMap<>();
        for (int i = 1; i <= 5; i++) byStars.put(i, 0L);
        for (Feedback f : all) {
            int star = (int) Math.round(overall(f));
            star = Math.max(1, Math.min(5, star));
            byStars.put(star, byStars.getOrDefault(star, 0L) + 1);
        }

        // simple averages for categories (0 if none)
        double avgQuality = all.isEmpty() ? 0.0 : all.stream().mapToInt(Feedback::getQuality).average().orElse(0.0);
        double avgSupport = all.isEmpty() ? 0.0 : all.stream().mapToInt(Feedback::getSupport).average().orElse(0.0);

        FeedbackSummaryDTO dto = new FeedbackSummaryDTO();
        dto.setTotal(total);
        dto.setByStars(byStars);
        Map<String, Double> avgs = new LinkedHashMap<>();
        avgs.put("quality", round1(avgQuality));
        avgs.put("support", round1(avgSupport));
        dto.setAverages(avgs);
        return ResponseEntity.ok(dto);
    }

    /* ========= DELETE (admin action) ========= */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (feedbacks.existsById(id)) feedbacks.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /* ========= helpers ========= */

    private static FeedbackRowDTO toRow(Feedback f) {
        FeedbackRowDTO r = new FeedbackRowDTO();
        r.setId(f.getId());
        r.setEmail(f.getEmail());
        r.setFirst(f.getFirst());
        r.setLast(f.getLast());
        r.setRole(f.getRole());
        r.setNotes(f.getNotes());
        r.setQuality(f.getQuality());
        r.setSupport(f.getSupport());
        r.setUseful(f.getUseful());
        r.setMissing(f.getMissing());
        r.setCreatedAt(f.getCreatedAt());
        r.setComputedRating(round1(overall(f)));
        return r;
    }

    private static double overall(Feedback f) {
        // average two integers (1..5) → 1..5 (double)
        return (f.getQuality() + f.getSupport()) / 2.0;
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    /* ========= DTOs (package-private static to avoid "public type must be in its own file") ========= */

    @Data
    static class FeedbackRowDTO {
        private String id;
        private String email;
        private String first;
        private String last;
        private String role;
        private String notes;
        private int quality;
        private int support;
        private List<String> useful;
        private List<String> missing;
        private Instant createdAt;

        // convenience for UI (not required by your table, but handy)
        private Double computedRating;
    }

    @Data
    static class FeedbackSummaryDTO {
        private Integer total;
        private Map<Integer, Long> byStars;       // {5: 90, 4: 11, ...}
        private Map<String, Double> averages;     // {quality: 4.7, support: 4.6}
    }
}
