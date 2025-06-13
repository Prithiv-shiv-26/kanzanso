package net.kanzanso.Kanzanso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyBoostStatsDTO {
    private int streak;
    private int completionPercentage;
    private int insightsCount;
    private int totalChallengesCompleted;
    private List<String> completedToday;
}
