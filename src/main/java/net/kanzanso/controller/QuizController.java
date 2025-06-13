package net.kanzanso.controller;

import net.kanzanso.dto.QuestionDto;
import net.kanzanso.dto.QuizResultDto;
import net.kanzanso.dto.QuizSubmissionDto;
import net.kanzanso.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // Question management endpoints
    
    @PostMapping("/questions")
    public ResponseEntity<QuestionDto> createQuestion(@RequestBody QuestionDto questionDto) {
        return new ResponseEntity<>(quizService.createQuestion(questionDto), HttpStatus.CREATED);
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<QuestionDto> getQuestionById(@PathVariable String id) {
        return ResponseEntity.ok(quizService.getQuestionById(id));
    }

    @GetMapping("/questions")
    public ResponseEntity<List<QuestionDto>> getAllQuestions() {
        return ResponseEntity.ok(quizService.getAllQuestions());
    }

    @GetMapping("/questions/category/{category}")
    public ResponseEntity<List<QuestionDto>> getQuestionsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(quizService.getQuestionsByCategory(category));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<QuestionDto> updateQuestion(@PathVariable String id, @RequestBody QuestionDto questionDto) {
        return ResponseEntity.ok(quizService.updateQuestion(id, questionDto));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String id) {
        quizService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    // Quiz submission and results endpoints
    
    @PostMapping("/submit")
    public ResponseEntity<QuizResultDto> submitQuiz(@RequestBody QuizSubmissionDto quizSubmissionDto) {
        return new ResponseEntity<>(quizService.submitQuiz(quizSubmissionDto), HttpStatus.CREATED);
    }

    @GetMapping("/results/{id}")
    public ResponseEntity<QuizResultDto> getQuizResultById(@PathVariable String id) {
        return ResponseEntity.ok(quizService.getQuizResultById(id));
    }

    @GetMapping("/results/user/{userId}")
    public ResponseEntity<List<QuizResultDto>> getQuizResultsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(quizService.getQuizResultsByUserId(userId));
    }

    @GetMapping("/results/user/{userId}/latest")
    public ResponseEntity<List<QuizResultDto>> getLatestQuizResultsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(quizService.getLatestQuizResultsByUserId(userId));
    }
    
    // Enhanced quiz endpoints for the new features
    
    @GetMapping("/types")
    public ResponseEntity<List<String>> getQuizTypes() {
        // This will be implemented to return available quiz types
        // For now, return a hardcoded list
        return ResponseEntity.ok(List.of("initial_assessment", "weekly_checkin", "anxiety_focused", "depression_focused", "daily_mood"));
    }
    
    @GetMapping("/questions/type/{quizType}")
    public ResponseEntity<List<QuestionDto>> getQuestionsByQuizType(@PathVariable String quizType) {
        return ResponseEntity.ok(quizService.getQuestionsByQuizType(quizType));
    }
    
    @GetMapping("/results/user/{userId}/progress")
    public ResponseEntity<Map<String, Object>> getUserProgressOverTime(@PathVariable String userId) {
        // This will be implemented to return progress data over time
        // For now, return a map with the userId and a placeholder message
        return ResponseEntity.ok(Map.of(
            "userId", userId,
            "message", "Progress tracking will be implemented soon for user: " + userId
        ));
    }
    
    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<Map<String, Object>> getPersonalizedRecommendations(@PathVariable String userId) {
        // This will be implemented to return personalized recommendations based on quiz results
        // For now, return a map with the userId and a placeholder message
        return ResponseEntity.ok(Map.of(
            "userId", userId,
            "message", "Personalized recommendations will be implemented soon for user: " + userId
        ));
    }
}