package net.kanzanso.Kanzanso.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a subtask/checklist item within a TodoItem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubTask {
    private String id;
    private String text;
    private boolean completed;
}