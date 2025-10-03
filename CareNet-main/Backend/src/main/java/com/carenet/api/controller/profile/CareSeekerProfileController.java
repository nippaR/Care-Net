package com.carenet.api.controller.profile;

import com.carenet.api.model.User;
import com.carenet.api.model.profile.CareSeekerProfile;
import com.carenet.api.repository.CareSeekerProfileRepository;
import com.carenet.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/careseeker/profile")
@RequiredArgsConstructor
public class CareSeekerProfileController {

    private final CareSeekerProfileRepository profiles;
    private final UserRepository users;

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestAttribute("uid") String uid) {
        return profiles.findByUserId(uid)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> {
                User u = users.findById(uid).orElse(null);
                CareSeekerProfile p = new CareSeekerProfile();
                p.setUserId(uid);
                if (u != null) {
                    p.setEmail(u.getEmail());
                    p.setFirstName(u.getFirstName());
                    p.setLastName(u.getLastName());
                }
                return ResponseEntity.ok(p);
            });
    }

    @PutMapping("/me")
    public ResponseEntity<?> update(@RequestAttribute("uid") String uid,
                                    @RequestBody Map<String, Object> body) {
        CareSeekerProfile p = profiles.findByUserId(uid).orElseGet(() -> {
            CareSeekerProfile np = new CareSeekerProfile();
            np.setUserId(uid);
            return np;
        });

        // Simple string fields
        p.setPhone(stringOr(p.getPhone(), body.get("phone")));
        p.setAvatarUrl(stringOr(p.getAvatarUrl(), body.get("avatarUrl")));
        p.setLocation(stringOr(p.getLocation(), body.get("location")));
        p.setGender(stringOr(p.getGender(), body.get("gender")));

        // dob (yyyy-MM-dd)
        Object dobVal = body.get("dob");
        if (dobVal instanceof String s && !s.isBlank()) {
            p.setDob(LocalDate.parse(s));
        }

        // careTypes: accept any JSON array -> Set<String>
        Object careTypesVal = body.get("careTypes");
        if (careTypesVal instanceof Collection<?> col) {
            // map to strings; keep insertion order (just for UX stability)
            Set<String> types = col.stream()
                    .filter(e -> e != null && !e.toString().isBlank())
                    .map(e -> e.toString().trim())
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            p.setCareTypes(types);
        }

        profiles.save(p);
        return ResponseEntity.ok(p);
    }

    private static String stringOr(String current, Object incoming) {
        if (incoming instanceof String s) return s;
        return current;
    }
}
