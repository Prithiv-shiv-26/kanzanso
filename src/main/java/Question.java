package net.kanzanso.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "questions")
public class Question {
    
    @Id
    private String id;
    private String text;
    private List<String> options;
    private List<Integer> scores;
    private String category;
    
    public Question() {
    }
    
    public Question(String id, String text, List<String> options, List<Integer> scores, String category) {
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