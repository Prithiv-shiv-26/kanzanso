package net.kanzanso.Kanzanso.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "favorite_quotes")
public class FavoriteQuote {
    @Id
    private String id;
    private String userId;
    private String quoteId;
    private String text;
    private String author;
    private String category;
    private LocalDateTime dateAdded;

    public FavoriteQuote() {
    }

    public FavoriteQuote(String userId, String quoteId, String text, String author, String category, LocalDateTime dateAdded) {
        this.userId = userId;
        this.quoteId = quoteId;
        this.text = text;
        this.author = author;
        this.category = category;
        this.dateAdded = dateAdded;
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

    public String getQuoteId() {
        return quoteId;
    }

    public void setQuoteId(String quoteId) {
        this.quoteId = quoteId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(LocalDateTime dateAdded) {
        this.dateAdded = dateAdded;
    }
}
