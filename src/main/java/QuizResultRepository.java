package net.kanzanso.repository;

import net.kanzanso.model.QuizResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizResultRepository extends MongoRepository<QuizResult, String> {
    
    List<QuizResult> findByUserId(String userId);
    
    List<QuizResult> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<QuizResult> findByUserIdAndQuizType(String userId, String quizType);
    
    List<QuizResult> findByUserIdAndQuizTypeOrderByCreatedAtDesc(String userId, String quizType);
    
}