package net.kanzanso.Kanzanso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActivityDTO {
    private String id;
    private String userId;
    
    private LocalDateTime lastJournalDate;
    private LocalDateTime lastQuizDate;
    private LocalDateTime lastMeditationDate;
    private LocalDateTime lastMoodEntryDate;
    private LocalDateTime lastTodoCompletionDate;
    private LocalDateTime lastPlaylistDate;
    
    private int currentStreak;
    private int longestStreak;
    private LocalDateTime lastStreakDate;
    
    private int totalChallengesCompleted;
    private int insightsUnlocked;
    
    private Map<String, Integer> activityCounts = new HashMap<>();
    
    private LocalDateTime updatedAt;
}
