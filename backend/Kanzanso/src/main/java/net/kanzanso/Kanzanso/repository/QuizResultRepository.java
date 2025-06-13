package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.QuizResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuizResultRepository extends MongoRepository<QuizResult, String> {
    List<QuizResult> findByUserId(String userId);
    List<QuizResult> findByUserIdAndQuizType(String userId, String quizType);
    List<QuizResult> findByUserIdAndTakenAtBetween(String userId, LocalDateTime start, LocalDateTime end);
    void deleteByUserId(String userId);
}