package net.kanzanso.Kanzanso.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "mood_entries")
public class MoodEntry {
    @Id
    private String id;
    private String userId;
    private String mood; // "great", "good", "okay", "down", "awful"
    private String note;
    private LocalDateTime date;

    public MoodEntry() {
    }

    public MoodEntry(String userId, String mood, String note, LocalDateTime date) {
        this.userId = userId;
        this.mood = mood;
        this.note = note;
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

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
