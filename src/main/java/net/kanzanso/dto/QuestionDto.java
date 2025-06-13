package net.kanzanso.dto;

import java.util.List;

/**
 * Data Transfer Object for Question entity
 */
public class QuestionDto {
    
    private String id;
    private String text;
    private List<String> options;
    private List<Integer> scores;
    private String category;
    
    public QuestionDto() {
    }
    
    public QuestionDto(String id, String text, List<String> options, List<Integer> scores, String category) {
        this.id = id;
        this.text = text;
        this.options = options;
        this.scores = scores;
        this.category = category;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public List<String> getOptions() {
        return options;
    }
    
    public void setOptions(List<String> options) {
        this.options = options;
    }
    
    public List<Integer> getScores() {
        return scores;
    }
    
    public void setScores(List<Integer> scores) {
        this.scores = scores;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
}