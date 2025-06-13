package net.kanzanso.Kanzanso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsightDTO {
    private String id;
    private String title;
    private String content;
    private String source;
    private String category;
    private LocalDateTime createdAt;
    private boolean isUnlocked;
}
