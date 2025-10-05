package com.carenet.api.model.feedback;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.List;

@Data
@Document("feedback")
public class Feedback {
    @Id
    private String id;

    @NotBlank
    private String first;

    @NotBlank
    private String last;

    @Email @NotBlank
    @Indexed
    private String email;

    private String role;            // "Owner / Founder" | "Manager" | etc.

    private String notes;           // free text

    @Min(1) @Max(5)
    private int quality;            // 1..5

    @Min(1) @Max(5)
    private int support;            // 1..5

    private List<@NotBlank String> useful;   // selected useful features
    private List<@NotBlank String> missing;  // selected missing features

    @Indexed
    private Instant createdAt = Instant.now();

    public void setUpdatedAt(Instant now) {
        
        throw new UnsupportedOperationException("Unimplemented method 'setUpdatedAt'");
    }
}
