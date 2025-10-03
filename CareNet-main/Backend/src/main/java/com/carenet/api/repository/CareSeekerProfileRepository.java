// src/main/java/com/carenet/api/repository/CareSeekerProfileRepository.java
package com.carenet.api.repository;

import com.carenet.api.model.profile.CareSeekerProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface CareSeekerProfileRepository extends MongoRepository<CareSeekerProfile, String> {
    Optional<CareSeekerProfile> findByUserId(String userId);
}
