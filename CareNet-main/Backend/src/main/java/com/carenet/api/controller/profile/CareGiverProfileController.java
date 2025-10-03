package com.carenet.api.controller.profile;

import com.carenet.api.model.User;
import com.carenet.api.model.profile.CareGiverProfile;
import com.carenet.api.repository.CareGiverProfileRepository;
import com.carenet.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/caregiver/profile")
public class CareGiverProfileController {

    private final CareGiverProfileRepository profiles;
    private final UserRepository users;

    // ---------- Authenticated endpoints (current logged-in caregiver) ----------

    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        String email = principal.getName();
        var p = profiles.findByEmail(email).orElseGet(() -> {
            // bootstrap from User if needed
            User u = users.findByEmail(email).orElse(null);
            var np = new CareGiverProfile();
            np.setEmail(email);
            if (u != null) {
                String first = u.getFirstName() == null ? "" : u.getFirstName();
                String last  = u.getLastName() == null ? "" : " " + u.getLastName();
                np.setUsername((first + last).trim());
            }
            return profiles.save(np);
        });
        return ResponseEntity.ok(p);
    }

    @PutMapping("/me")
    public ResponseEntity<?> update(@RequestBody CareGiverProfile incoming, Principal principal) {
        String email = principal.getName();
        var p = profiles.findByEmail(email).orElseGet(() -> {
            var np = new CareGiverProfile();
            np.setEmail(email);
            return np;
        });

        // only overwrite allowed fields
        p.setUsername(incoming.getUsername());
        p.setAvatarUrl(incoming.getAvatarUrl());
        p.setTagline(incoming.getTagline());
        p.setAbout(incoming.getAbout());
        p.setLanguages(incoming.getLanguages());
        p.setCertifications(incoming.getCertifications());
        p.setWorkHistory(incoming.getWorkHistory());
        p.setServiceRadius(incoming.getServiceRadius());
        p.setYears(incoming.getYears());
        p.setSkills(incoming.getSkills());

        profiles.save(p);
        return ResponseEntity.ok(p);
    }

    // ---------- Public endpoints (for CareSeeker UI) ----------

    /**
     * Lightweight list for left-side cards.
     * You can keep this unauthenticated or add security as needed.
     */
    @GetMapping("/public")
    public List<CareGiverCardDto> listPublic() {
        return profiles.findAll()
                .stream()
                .map(p -> new CareGiverCardDto(
                        p.getId(),
                        p.getUsername(),
                        p.getAvatarUrl(),
                        p.getTagline(),
                        p.getSkills(),
                        p.getLanguages()
                ))
                .toList();
    }

    /**
     * Full profile by ID for the right-side detail panel.
     */
    @GetMapping("/public/{id}")
    public ResponseEntity<?> getPublic(@PathVariable String id) {
        return profiles.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ---------- DTOs ----------

    /**
     * Minimal DTO used by /public list to keep payload small for the cards.
     */
    public record CareGiverCardDto(
            String id,
            String username,
            String avatarUrl,
            String tagline,
            java.util.Set<String> skills,
            java.util.List<CareGiverProfile.Lang> languages
    ) {}
}
