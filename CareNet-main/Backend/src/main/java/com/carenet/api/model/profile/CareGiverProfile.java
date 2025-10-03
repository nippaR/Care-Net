package com.carenet.api.model.profile;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Set;

@Data
@Document("caregiver_profiles")
public class CareGiverProfile {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;           // links to User.email

    // Header
    private String username;        // display name
    private String avatarUrl;

    // About
    private String tagline;         // short punchline
    private String about;           // longer description

    // Languages
    @Data
    public static class Lang {
        private String lang;        // e.g., "English"
        private String level;       // "Basic" | "Conversational" | "Fluent" | "Native"
    }
    private List<Lang> languages;

    // Certifications
    @Data
    public static class Cert {
        private String name;
        private String issuer;
        private String year;
    }
    private List<Cert> certifications;

    // Work history
    @Data
    public static class Work {
        private String role;
        private String company;
        private String from;        // free-form (e.g., "2022")
        private String to;          // free-form (e.g., "2024" / "Present")
    }
    private List<Work> workHistory;

    // Service radius & years
    private String serviceRadius;   // e.g., "25 km within Colombo"
    private String years;           // e.g., "5 years"

    // Skills / service types
    private Set<String> skills;     // tags (e.g., "Child Care", "CPR", etc.)
}
