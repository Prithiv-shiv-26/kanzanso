package net.kanzanso.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Data Transfer Object for QuizResult entity
 */
public class QuizResultDto {
    
    private String id;
    private String userId;
    private String quizType;
    private Map<String, Integer> categoryScores;
    private int totalScore;
    private String resultSummary;
    private LocalDateTime createdAt;
    
    public QuizResultDto() {
    }
    
    public QuizResultDto(String id, String userId, String quizType, Map<String, Integer> categoryScores, 
                        int totalScore, String resultSummary, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.quizType = quizType;
        this.categoryScores = categoryScores;
        this.totalScore = totalScore;
        this.resultSummary = resultSummary;
        this.createdAt = createdAt;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
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
    
    public Map<String, Integer> getCategoryScores() {
        return categoryScores;
    }
    
    public void setCategoryScores(Map<String, Integer> categoryScores) {
        this.categoryScores = categoryScores;
    }
    
    public int getTotalScore() {
        return totalScore;
    }
    
    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }
    
    public String getResultSummary() {
        return resultSummary;
    }
    
    public void setResultSummary(String resultSummary) {
        this.resultSummary = resultSummary;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}