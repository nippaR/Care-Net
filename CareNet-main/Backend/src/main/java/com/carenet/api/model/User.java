package com.carenet.api.model;

import com.carenet.api.model.common.Role;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document("users")
public class User {

    @Id
    private String id;

    private String firstName;
    private String lastName;

    @Indexed(unique = true)
    private String email;

    // hashed password (e.g., BCrypt)
    private String passwordHash;

    // optional but useful for your admin table
    private String phone;

    private String city;
    private String address;

    // e.g., [CARE_SEEKER], [CAREGIVER], [ADMIN]
    private Set<Role> roles;

    // Account status for login control
    public enum Status { ACTIVE, DEACTIVATED }

    /**
     * Default ACTIVE for newly created users.
     * Note: existing documents without this field will read as null;
     * handle that as ACTIVE in your auth logic or backfill.
     */
    @Builder.Default
    private Status status = Status.ACTIVE;

    /** Convenience helper (optional) */
    public boolean isActive() {
        return status == null || status == Status.ACTIVE;
    }
}
