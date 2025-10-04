package com.carenet.api.repository;

import com.carenet.api.model.feedback.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    java.util.List<Feedback> findAllByOrderByCreatedAtDesc();
}
