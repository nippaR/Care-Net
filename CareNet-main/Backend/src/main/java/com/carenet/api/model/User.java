package com.carenet.api.model;

import com.carenet.api.model.common.Role;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Set;

@Data
@Document("users")
public class User {
    @Id private String id;
    private String firstName;
    private String lastName;
    @Indexed(unique = true)
    private String email;
    private String passwordHash;
    private String city;
    private String address;
    private Set<Role> roles; // e.g., [CARE_SEEKER] or [CAREGIVER] or [ADMIN]
}
