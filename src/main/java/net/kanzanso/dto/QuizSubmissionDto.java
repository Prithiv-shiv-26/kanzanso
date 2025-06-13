package net.kanzanso.dto;

import java.util.Map;

/**
 * Data Transfer Object for quiz submissions
 */
public class QuizSubmissionDto {
    
    private String userId;
    private String quizType;
    private Map<String, Integer> answers; // Map of questionId to selected option index
    
    public QuizSubmissionDto() {
    }
    
    public QuizSubmissionDto(String userId, String quizType, Map<String, Integer> answers) {
        this.userId = userId;
        this.quizType = quizType;
        this.answers = answers;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getQuizType() {
        return quizType;
    }
    
    public void setQuizType(String quizType) {
        this.quizType = quizType;
    }
    
    public Map<String, Integer> getAnswers() {
        return answers;
    }
    
    public void setAnswers(Map<String, Integer> answers) {
        this.answers = answers;
    }
}