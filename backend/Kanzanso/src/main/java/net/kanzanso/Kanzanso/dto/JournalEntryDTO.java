package net.kanzanso.Kanzanso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntryDTO {
    private String id;
    
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;
    
    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 10000, message = "Content must be between 1 and 10000 characters")
    private String content;
    
    @Size(max = 50, message = "Mood cannot exceed 50 characters")
    private String mood;
    
    @Size(max = 50, message = "Weather cannot exceed 50 characters")
    private String weather;
    
    @Min(value = 1, message = "Motivation level must be at least 1")
    @Max(value = 10, message = "Motivation level must be at most 10")
    private Integer motivationLevel;
    
    @Size(max = 1000, message = "Gratitude cannot exceed 1000 characters")
    private String gratitude;
    
    private Map<String, Object> customFields = new HashMap<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}