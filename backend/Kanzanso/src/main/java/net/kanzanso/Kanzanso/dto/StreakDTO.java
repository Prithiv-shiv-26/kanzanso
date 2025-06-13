package net.kanzanso.Kanzanso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreakDTO {
    private String id;
    
    @NotBlank(message = "Streak name is required")
    @Size(min = 1, max = 100, message = "Streak name must be between 1 and 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    @Min(value = 0, message = "Current count cannot be negative")
    private int currentCount;
    
    @Min(value = 0, message = "Highest count cannot be negative")
    private int highestCount;
    
    private List<LocalDate> streakDates = new ArrayList<>();
    
    @NotBlank(message = "Streak type is required")
    @Size(min = 1, max = 50, message = "Streak type must be between 1 and 50 characters")
    private String type;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDate lastCompletedDate;
}