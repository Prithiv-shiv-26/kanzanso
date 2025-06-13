package net.kanzanso.Kanzanso.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "quiz_results")
public class QuizResult {
    @Id
    private String id;
    
    // Type of quiz (e.g., "mental_health", "personality", etc.)
    private String quizType;
    
    // Overall score
    private Integer score;
    
    // Detailed results by category
    private Map<String, Integer> categoryScores = new HashMap<>();
    
    // Interpretation of the results
    private String interpretation;
    
    // Recommendations based on the results
    private String recommendations;
    
    private LocalDateTime takenAt;
    
    // Reference to the user who took this quiz
    private String userId;
}