package net.kanzanso.Kanzanso.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "gratitude_entries")
public class GratitudeEntry {
    @Id
    private String id;
    private String userId;
    private String content;
    private List<String> tags;
    private LocalDateTime date;

    public GratitudeEntry() {
    }

    public GratitudeEntry(String userId, String content, List<String> tags, LocalDateTime date) {
        this.userId = userId;
        this.content = content;
        this.tags = tags;
        this.date = date;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
