package net.kanzanso.Kanzanso.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "journal_entries")
public class JournalEntry {
    @Id
    private String id;
    
    private String title;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    // For mood tracking
    private String mood;
    
    // For weather tracking
    private String weather;
    
    // For motivation level
    private Integer motivationLevel;
    
    // For gratitude entries
    private String gratitude;
    
    // Additional custom fields
    private Map<String, Object> customFields = new HashMap<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Reference to the user who owns this journal entry
    private String userId;
}