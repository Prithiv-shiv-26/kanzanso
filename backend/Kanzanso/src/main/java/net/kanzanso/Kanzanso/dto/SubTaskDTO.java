package net.kanzanso.Kanzanso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for SubTask entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubTaskDTO {
    private String id;
    
    @NotBlank(message = "Subtask description is required")
    @Size(min = 1, max = 200, message = "Subtask description must be between 1 and 200 characters")
    private String text;
    
    private boolean completed;
}