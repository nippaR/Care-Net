// src/main/java/com/carenet/api/model/profile/CareSeekerProfile.java
package com.carenet.api.model.profile;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.util.Set;

@Data
@Document("careseeker_profiles")
public class CareSeekerProfile {
    @Id private String id;

    @Indexed(unique = true)
    private String userId;

    private String email;
    private String firstName;
    private String lastName;

    private String phone;
    private String avatarUrl;

    // UI fields
    private String location;
    private String gender;
    private LocalDate dob;
    private Set<String> careTypes;
}
