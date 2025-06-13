package net.kanzanso.service;

import net.kanzanso.dto.QuestionDto;
import net.kanzanso.dto.QuizResultDto;
import net.kanzanso.dto.QuizSubmissionDto;

import java.util.List;

public interface QuizService {
    
    // Question management
    QuestionDto createQuestion(QuestionDto questionDto);
    
    QuestionDto getQuestionById(String id);
    
    List<QuestionDto> getAllQuestions();
    
    List<QuestionDto> getQuestionsByCategory(String category);
    
    /**
     * Get questions for a specific quiz type
     * 
     * @param quizType the type of quiz (e.g., initial_assessment, weekly_checkin)
     * @return a list of questions for the quiz type
     */
    List<QuestionDto> getQuestionsByQuizType(String quizType);
    
    QuestionDto updateQuestion(String id, QuestionDto questionDto);
    
    void deleteQuestion(String id);
    
    // Quiz submission and results
    QuizResultDto submitQuiz(QuizSubmissionDto quizSubmissionDto);
    
    QuizResultDto getQuizResultById(String id);
    
    List<QuizResultDto> getQuizResultsByUserId(String userId);
    
    List<QuizResultDto> getLatestQuizResultsByUserId(String userId);
}