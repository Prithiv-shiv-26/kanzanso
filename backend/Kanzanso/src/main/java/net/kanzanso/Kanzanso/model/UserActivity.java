package net.kanzanso.Kanzanso.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "user_activities")
public class UserActivity {
    @Id
    private String id;
    
    private String userId;
    
    // Last activity timestamps for different features
    private LocalDateTime lastJournalDate;
    private LocalDateTime lastQuizDate;
    private LocalDateTime lastMeditationDate;
    private LocalDateTime lastMoodEntryDate;
    private LocalDateTime lastTodoCompletionDate;
    private LocalDateTime lastPlaylistDate;
    
    // Streak information
    private int currentStreak;
    private int longestStreak;
    private LocalDateTime lastStreakDate;
    
    // Challenge statistics
    private int totalChallengesCompleted;
    private int insightsUnlocked;
    
    // Additional activity metrics
    private Map<String, Integer> activityCounts = new HashMap<>();
    
    // Last updated timestamp
    private LocalDateTime updatedAt;
}
