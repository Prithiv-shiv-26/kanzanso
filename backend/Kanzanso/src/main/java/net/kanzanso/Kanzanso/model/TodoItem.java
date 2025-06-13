package net.kanzanso.Kanzanso.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "todo_items")
public class TodoItem {
    @Id
    private String id;
    
    @NotBlank(message = "Task description is required")
    private String text;
    
    private boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Reference to the user who owns this todo item
    private String userId;
    
    // New fields for enhanced functionality
    private List<String> tags;
    private LocalDateTime dueDate;
    private boolean hasReminder;
    private LocalDateTime reminderTime;
    
    // Priority: 1 (Low), 2 (Medium), 3 (High)
    private int priority;
    
    // Subtasks/Checklist items
    private List<SubTask> subTasks;
    
    // Color for visual organization (hex code)
    private String color;
    
    // Notes or additional details
    private String notes;
}