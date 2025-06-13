package net.kanzanso.Kanzanso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodoItemDTO {
    private String id;
    
    @NotBlank(message = "Task description is required")
    @Size(min = 1, max = 500, message = "Task description must be between 1 and 500 characters")
    private String text;
    
    private boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // New fields for enhanced functionality
    private List<String> tags;
    private LocalDateTime dueDate;
    private boolean hasReminder;
    private LocalDateTime reminderTime;
    
    // Priority: 1 (Low), 2 (Medium), 3 (High)
    private int priority;
    
    // Subtasks/Checklist items
    private List<SubTaskDTO> subTasks;
    
    // Color for visual organization (hex code)
    private String color;
    
    // Notes or additional details
    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
}