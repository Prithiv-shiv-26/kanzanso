package net.kanzanso.Kanzanso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionDTO {
    private String id;
    
    @NotBlank(message = "Question text is required")
    @Size(min = 5, max = 500, message = "Question text must be between 5 and 500 characters")
    private String text;
    
    @NotEmpty(message = "Options are required")
    private List<String> options;
    
    private List<Integer> scores;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    private String quizType;
}
