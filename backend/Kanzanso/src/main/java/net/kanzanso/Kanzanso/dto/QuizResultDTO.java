package net.kanzanso.Kanzanso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultDTO {
    private String id;
    
    @NotBlank(message = "Quiz type is required")
    @Size(min = 1, max = 50, message = "Quiz type must be between 1 and 50 characters")
    private String quizType;
    
    @Min(value = 0, message = "Score cannot be negative")
    @Max(value = 100, message = "Score cannot exceed 100")
    private Integer score;
    
    private Map<String, Integer> categoryScores = new HashMap<>();
    
    @Size(max = 2000, message = "Interpretation cannot exceed 2000 characters")
    private String interpretation;
    
    @Size(max = 2000, message = "Recommendations cannot exceed 2000 characters")
    private String recommendations;
    
    private LocalDateTime takenAt;
}