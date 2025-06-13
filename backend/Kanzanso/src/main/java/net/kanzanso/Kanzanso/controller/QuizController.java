package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.dto.QuizQuestionDTO;
import net.kanzanso.Kanzanso.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/quiz-types")
    public ResponseEntity<List<String>> getQuizTypes() {
        return ResponseEntity.ok(quizService.getQuizTypes());
    }

    @GetMapping("/quiz-questions")
    public ResponseEntity<List<QuizQuestionDTO>> getAllQuestions() {
        return ResponseEntity.ok(quizService.getAllQuestions());
    }

    @GetMapping("/quiz-questions/type/{quizType}")
    public ResponseEntity<List<QuizQuestionDTO>> getQuestionsByType(@PathVariable String quizType) {
        return ResponseEntity.ok(quizService.getQuestionsByType(quizType));
    }

    @GetMapping("/quiz-questions/category/{category}")
    public ResponseEntity<List<QuizQuestionDTO>> getQuestionsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(quizService.getQuestionsByCategory(category));
    }
}
