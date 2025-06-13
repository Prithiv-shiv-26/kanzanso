package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.QuizQuestionDTO;
import net.kanzanso.Kanzanso.model.Question;
import net.kanzanso.Kanzanso.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuestionRepository questionRepository;

    @Autowired
    public QuizService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public List<String> getQuizTypes() {
        return Arrays.asList(
            "initial_assessment",
            "weekly_checkin",
            "anxiety_focused",
            "depression_focused",
            "daily_mood"
        );
    }

    public List<QuizQuestionDTO> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<QuizQuestionDTO> getQuestionsByType(String quizType) {
        // Filter questions by quiz type
        return questionRepository.findAll().stream()
                .map(this::convertToDTO)
                .filter(q -> q.getQuizType().equals(quizType))
                .collect(Collectors.toList());
    }

    public List<QuizQuestionDTO> getQuestionsByCategory(String category) {
        return questionRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Helper method to convert Question to QuizQuestionDTO
    private QuizQuestionDTO convertToDTO(Question question) {
        return QuizQuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .options(question.getOptions())
                .scores(question.getScores())
                .category(question.getCategory())
                .quizType(question.getQuizType() != null ? question.getQuizType() : "initial_assessment") // Use question's quiz type or default
                .build();
    }
}
