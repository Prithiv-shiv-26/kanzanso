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
@Document(collection = "insights")
public class Insight {
    @Id
    private String id;
    
    private String title;
    private String content;
    private String source;
    private String category;
    private String userId;
    private LocalDateTime createdAt;
    private boolean isUnlocked;
}
