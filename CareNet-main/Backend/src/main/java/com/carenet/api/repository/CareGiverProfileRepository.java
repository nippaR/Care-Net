package com.carenet.api.repository;

import com.carenet.api.model.profile.CareGiverProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CareGiverProfileRepository extends MongoRepository<CareGiverProfile, String> {
    Optional<CareGiverProfile> findByEmail(String email);
}
