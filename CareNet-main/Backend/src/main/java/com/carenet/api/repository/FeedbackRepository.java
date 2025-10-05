package com.carenet.api.repository;

import com.carenet.api.model.feedback.Feedback;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    java.util.List<Feedback> findAllByOrderByCreatedAtDesc();
    List<Feedback> findByEmailOrderByCreatedAtDesc(String email);
    Optional<Feedback> findByIdAndEmail(String id, String email);
}
