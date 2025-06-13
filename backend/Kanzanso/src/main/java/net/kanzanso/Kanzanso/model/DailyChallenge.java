package net.kanzanso.Kanzanso.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "daily_challenges")
public class DailyChallenge {
    @Id
    private String id;
    
    private String title;
    private String description;
    private String category;
    private int difficulty; // 1-3 scale
    private String link;
    private boolean completed;
    private int progress; // 0-100 percentage
    private String userId;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private LocalDateTime expiresAt; // When the challenge expires
}
