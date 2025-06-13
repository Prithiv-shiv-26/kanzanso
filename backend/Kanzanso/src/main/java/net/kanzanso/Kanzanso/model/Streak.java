package net.kanzanso.Kanzanso.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "streaks")
public class Streak {
    @Id
    private String id;
    
    @NotBlank(message = "Streak name is required")
    private String name;
    
    private String description;
    
    // Current streak count
    private int currentCount;
    
    // Highest streak achieved
    private int highestCount;
    
    // List of dates when the streak was maintained
    private List<LocalDate> streakDates = new ArrayList<>();
    
    // Type of streak (e.g., "meditation", "exercise", "journaling")
    private String type;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDate lastCompletedDate;
    
    // Reference to the user who owns this streak
    private String userId;
}