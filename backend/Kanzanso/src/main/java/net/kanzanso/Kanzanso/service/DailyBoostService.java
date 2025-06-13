package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.DailyBoostStatsDTO;
import net.kanzanso.Kanzanso.dto.DailyChallengeDTO;
import net.kanzanso.Kanzanso.dto.InsightDTO;
import net.kanzanso.Kanzanso.dto.UserActivityDTO;
import net.kanzanso.Kanzanso.model.DailyChallenge;
import net.kanzanso.Kanzanso.model.Insight;
import net.kanzanso.Kanzanso.model.UserActivity;
import net.kanzanso.Kanzanso.repository.DailyChallengeRepository;
import net.kanzanso.Kanzanso.repository.InsightRepository;
import net.kanzanso.Kanzanso.repository.JournalEntryRepository;
import net.kanzanso.Kanzanso.repository.MoodEntryRepository;
import net.kanzanso.Kanzanso.repository.QuizResultRepository;
import net.kanzanso.Kanzanso.repository.TodoItemRepository;
import net.kanzanso.Kanzanso.repository.UserActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DailyBoostService {

    private final DailyChallengeRepository challengeRepository;
    private final UserActivityRepository userActivityRepository;
    private final InsightRepository insightRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final MoodEntryRepository moodEntryRepository;
    private final QuizResultRepository quizResultRepository;
    private final TodoItemRepository todoItemRepository;

    @Autowired
    public DailyBoostService(
            DailyChallengeRepository challengeRepository,
            UserActivityRepository userActivityRepository,
            InsightRepository insightRepository,
            JournalEntryRepository journalEntryRepository,
            MoodEntryRepository moodEntryRepository,
            QuizResultRepository quizResultRepository,
            TodoItemRepository todoItemRepository) {
        this.challengeRepository = challengeRepository;
        this.userActivityRepository = userActivityRepository;
        this.insightRepository = insightRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.moodEntryRepository = moodEntryRepository;
        this.quizResultRepository = quizResultRepository;
        this.todoItemRepository = todoItemRepository;
    }

    /**
     * Get or create user activity record
     */
    private UserActivity getOrCreateUserActivity(String userId) {
        try {
            return userActivityRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        UserActivity newActivity = new UserActivity();
                        newActivity.setUserId(userId);
                        newActivity.setCurrentStreak(0);
                        newActivity.setLongestStreak(0);
                        newActivity.setTotalChallengesCompleted(0);
                        newActivity.setInsightsUnlocked(0);
                        newActivity.setActivityCounts(new HashMap<>());
                        newActivity.setUpdatedAt(LocalDateTime.now());
                        return userActivityRepository.save(newActivity);
                    });
        } catch (Exception e) {
            // Handle the case where there are multiple UserActivity records for the same user
            List<UserActivity> activities = userActivityRepository.findAllByUserId(userId);

            if (activities.isEmpty()) {
                // Create a new activity record
                UserActivity newActivity = new UserActivity();
                newActivity.setUserId(userId);
                newActivity.setCurrentStreak(0);
                newActivity.setLongestStreak(0);
                newActivity.setTotalChallengesCompleted(0);
                newActivity.setInsightsUnlocked(0);
                newActivity.setActivityCounts(new HashMap<>());
                newActivity.setUpdatedAt(LocalDateTime.now());
                return userActivityRepository.save(newActivity);
            } else {
                // Use the most recently updated activity record
                UserActivity mostRecent = activities.stream()
                        .filter(a -> a.getUpdatedAt() != null)
                        .sorted((a1, a2) -> a2.getUpdatedAt().compareTo(a1.getUpdatedAt()))
                        .findFirst()
                        .orElse(activities.get(0));

                return mostRecent;
            }
        }
    }

    /**
     * Get daily challenges for a user
     */
    public List<DailyChallengeDTO> getDailyChallenges(String userId) {
        // Get current active challenges
        LocalDateTime now = LocalDateTime.now();
        List<DailyChallenge> activeChallenges = challengeRepository
                .findByUserIdAndCompletedFalseAndExpiresAtAfter(userId, now);

        // If we have enough active challenges, return them
        if (activeChallenges.size() >= 5) {
            return activeChallenges.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }

        // Otherwise, generate new challenges
        UserActivity userActivity = getOrCreateUserActivity(userId);
        List<DailyChallenge> newChallenges = generateChallenges(userId, userActivity);

        // Save new challenges
        challengeRepository.saveAll(newChallenges);

        // Combine existing and new challenges
        activeChallenges.addAll(newChallenges);

        return activeChallenges.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Generate personalized challenges based on user activity
     */
    private List<DailyChallenge> generateChallenges(String userId, UserActivity userActivity) {
        List<DailyChallenge> challenges = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.MIDNIGHT);

        // Journal challenge
        if (shouldGenerateJournalChallenge(userActivity)) {
            challenges.add(createJournalChallenge(userId, expiresAt));
        }

        // Todo challenge
        challenges.add(createTodoChallenge(userId, expiresAt));

        // Mood or quiz challenge
        if (shouldGenerateQuizChallenge(userActivity)) {
            challenges.add(createQuizChallenge(userId, expiresAt));
        } else {
            challenges.add(createMoodChallenge(userId, expiresAt));
        }

        // Meditation challenge
        if (shouldGenerateMeditationChallenge(userActivity)) {
            challenges.add(createMeditationChallenge(userId, expiresAt));
        }

        // Add random challenges if we need more
        int neededChallenges = 5 - challenges.size();
        if (neededChallenges > 0) {
            challenges.addAll(createRandomChallenges(userId, expiresAt, neededChallenges));
        }

        return challenges;
    }

    /**
     * Check if we should generate a journal challenge
     */
    private boolean shouldGenerateJournalChallenge(UserActivity userActivity) {
        if (userActivity.getLastJournalDate() == null) {
            return true;
        }

        LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);
        return userActivity.getLastJournalDate().isBefore(twoDaysAgo);
    }

    /**
     * Check if we should generate a quiz challenge
     */
    private boolean shouldGenerateQuizChallenge(UserActivity userActivity) {
        if (userActivity.getLastQuizDate() == null) {
            return true;
        }

        LocalDateTime fiveDaysAgo = LocalDateTime.now().minusDays(5);
        return userActivity.getLastQuizDate().isBefore(fiveDaysAgo);
    }

    /**
     * Check if we should generate a meditation challenge
     */
    private boolean shouldGenerateMeditationChallenge(UserActivity userActivity) {
        // If user has never meditated, suggest it
        if (userActivity.getLastMeditationDate() == null) {
            return true;
        }

        // If user has meditated recently, don't suggest it
        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);
        if (userActivity.getLastMeditationDate().isAfter(threeDaysAgo)) {
            return false;
        }

        // If user has shown signs of stress in mood entries, suggest meditation
        // This would require analyzing mood entries, which is beyond this example
        return true;
    }

    /**
     * Create a journal challenge
     */
    private DailyChallenge createJournalChallenge(String userId, LocalDateTime expiresAt) {
        List<DailyChallenge> journalChallenges = Arrays.asList(
            DailyChallenge.builder()
                .id(UUID.randomUUID().toString())
                .title("Reconnect with Journaling")
                .description("It's been a while! Write a journal entry about what's been on your mind lately.")
                .category("Journal")
                .difficulty(2)
                .link("../know_yourself/index.html#journal")
                .completed(false)
                .progress(0)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build(),

            DailyChallenge.builder()
                .id(UUID.randomUUID().toString())
                .title("Emotion Deep Dive")
                .description("Write a journal entry and tag an emotion you rarely acknowledge.")
                .category("Journal")
                .difficulty(3)
                .link("../know_yourself/index.html#journal")
                .completed(false)
                .progress(0)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build(),

            DailyChallenge.builder()
                .id(UUID.randomUUID().toString())
                .title("Gratitude Reflection")
                .description("Write down three things you're grateful for today in your journal.")
                .category("Journal")
                .difficulty(1)
                .link("../know_yourself/index.html#gratitude")
                .completed(false)
                .progress(0)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build()
        );

        return journalChallenges.get(new Random().nextInt(journalChallenges.size()));
    }

    /**
     * Create a todo challenge
     */
    private DailyChallenge createTodoChallenge(String userId, LocalDateTime expiresAt) {
        List<DailyChallenge> todoChallenges = Arrays.asList(
            DailyChallenge.builder()
                .id(UUID.randomUUID().toString())
                .title("Task Kickstart")
                .description("Complete any two tasks from your to-do list today.")
                .category("To-Do")
                .difficulty(2)
                .link("../to_do_list/index.html")
                .completed(false)
                .progress(0)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build(),

            DailyChallenge.builder()
                .id(UUID.randomUUID().toString())
                .title("Priority Focus")
                .description("Complete any task with a priority score above 7.")
                .category("To-Do")
                .difficulty(3)
                .link("../to_do_list/index.html")
                .completed(false)
                .progress(0)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build(),

            DailyChallenge.builder()
                .id(UUID.randomUUID().toString())
                .title("Self-Care Task")
                .description("Add and complete one self-care task to your to-do list.")
                .category("To-Do")
                .difficulty(1)
                .link("../to_do_list/index.html")
                .completed(false)
                .progress(0)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build()
        );

        return todoChallenges.get(new Random().nextInt(todoChallenges.size()));
    }

    /**
     * Create a mood challenge
     */
    private DailyChallenge createMoodChallenge(String userId, LocalDateTime expiresAt) {
        return DailyChallenge.builder()
            .id(UUID.randomUUID().toString())
            .title("Mood Tracker")
            .description("Record your mood for today and note what influenced it.")
            .category("Mood")
            .difficulty(1)
            .link("../know_yourself/index.html#mood-tracker")
            .completed(false)
            .progress(0)
            .userId(userId)
            .createdAt(LocalDateTime.now())
            .expiresAt(expiresAt)
            .build();
    }

    /**
     * Create a quiz challenge
     */
    private DailyChallenge createQuizChallenge(String userId, LocalDateTime expiresAt) {
        return DailyChallenge.builder()
            .id(UUID.randomUUID().toString())
            .title("Mental Health Check-in")
            .description("Take a quick mental health assessment to see how you're doing.")
            .category("Assessment")
            .difficulty(2)
            .link("../mental_health_quiz/index.html")
            .completed(false)
            .progress(0)
            .userId(userId)
            .createdAt(LocalDateTime.now())
            .expiresAt(expiresAt)
            .build();
    }

    /**
     * Create a meditation challenge
     */
    private DailyChallenge createMeditationChallenge(String userId, LocalDateTime expiresAt) {
        List<DailyChallenge> meditationChallenges = Arrays.asList(
            DailyChallenge.builder()
                .id(UUID.randomUUID().toString())
                .title("Quick Meditation")
                .description("Take 3 minutes for a quick mindfulness meditation.")
                .category("Mindfulness")
                .difficulty(1)
                .link("../meditation/index.html")
                .completed(false)
                .progress(0)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build(),

            DailyChallenge.builder()
                .id(UUID.randomUUID().toString())
                .title("Breathing Exercise")
                .description("Practice deep breathing for 5 minutes to reduce stress.")
                .category("Mindfulness")
                .difficulty(1)
                .link("../meditation/index.html")
                .completed(false)
                .progress(0)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build()
        );

        return meditationChallenges.get(new Random().nextInt(meditationChallenges.size()));
    }

    /**
     * Create random challenges
     */
    private List<DailyChallenge> createRandomChallenges(String userId, LocalDateTime expiresAt, int count) {
        List<DailyChallenge> randomChallenges = Arrays.asList(
            DailyChallenge.builder()
                .id(UUID.randomUUID().toString())
                .title("Music Therapy")
                .description("Listen to today's recommended mood track and rate how it made you feel.")
                .category("Playlist")
                .difficulty(1)
                .link("../playlist/index.html")
                .completed(false)
                .progress(0)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build(),

            DailyChallenge.builder()
                .id(UUID.randomUUID().toString())
                .title("Inspirational Quote")
                .description("Find a quote that resonates with you today and save it to your favorites.")
                .category("Growth")
                .difficulty(1)
                .link("../know_yourself/index.html#motivation")
                .completed(false)
                .progress(0)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build(),

            DailyChallenge.builder()
                .id(UUID.randomUUID().toString())
                .title("Mindful Break")
                .description("Take a 10-minute break away from screens to reset your mind.")
                .category("Mindfulness")
                .difficulty(2)
                .link("../meditation/index.html")
                .completed(false)
                .progress(0)
                .userId(userId)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build()
        );

        Collections.shuffle(randomChallenges);
        return randomChallenges.subList(0, Math.min(count, randomChallenges.size()));
    }

    /**
     * Complete a challenge
     */
    public DailyChallengeDTO completeChallenge(String userId, String challengeId) {
        DailyChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        // Verify the challenge belongs to the user
        if (!challenge.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Challenge does not belong to this user");
        }

        // Mark as completed
        challenge.setCompleted(true);
        challenge.setCompletedAt(LocalDateTime.now());
        challenge.setProgress(100);

        // Save the updated challenge
        DailyChallenge savedChallenge = challengeRepository.save(challenge);

        // Update user activity
        updateUserActivity(userId, challenge.getCategory());

        // Check if we should unlock an insight
        checkAndUnlockInsight(userId);

        return convertToDTO(savedChallenge);
    }

    /**
     * Update challenge progress
     */
    public DailyChallengeDTO updateChallengeProgress(String userId, String challengeId, int progress) {
        DailyChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        // Verify the challenge belongs to the user
        if (!challenge.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Challenge does not belong to this user");
        }

        // Update progress
        challenge.setProgress(Math.min(100, Math.max(0, progress)));

        // If progress is 100%, mark as completed
        if (challenge.getProgress() == 100) {
            challenge.setCompleted(true);
            challenge.setCompletedAt(LocalDateTime.now());

            // Update user activity
            updateUserActivity(userId, challenge.getCategory());

            // Check if we should unlock an insight
            checkAndUnlockInsight(userId);
        }

        // Save the updated challenge
        DailyChallenge savedChallenge = challengeRepository.save(challenge);

        return convertToDTO(savedChallenge);
    }

    /**
     * Update user activity when a challenge is completed
     */
    private void updateUserActivity(String userId, String category) {
        UserActivity userActivity = getOrCreateUserActivity(userId);
        LocalDateTime now = LocalDateTime.now();

        // Update last activity date based on category
        switch (category.toLowerCase()) {
            case "journal":
                userActivity.setLastJournalDate(now);
                break;
            case "mood":
                userActivity.setLastMoodEntryDate(now);
                break;
            case "assessment":
                userActivity.setLastQuizDate(now);
                break;
            case "mindfulness":
                userActivity.setLastMeditationDate(now);
                break;
            case "to-do":
                userActivity.setLastTodoCompletionDate(now);
                break;
            case "playlist":
                userActivity.setLastPlaylistDate(now);
                break;
        }

        // Update activity counts
        Map<String, Integer> counts = userActivity.getActivityCounts();
        counts.put(category, counts.getOrDefault(category, 0) + 1);
        userActivity.setActivityCounts(counts);

        // Update total challenges completed
        userActivity.setTotalChallengesCompleted(userActivity.getTotalChallengesCompleted() + 1);

        // Update streak
        updateStreak(userActivity);

        // Save updated activity
        userActivity.setUpdatedAt(now);
        userActivityRepository.save(userActivity);
    }

    /**
     * Update user streak
     */
    private void updateStreak(UserActivity userActivity) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastStreakDate = userActivity.getLastStreakDate();

        if (lastStreakDate == null) {
            // First activity
            userActivity.setCurrentStreak(1);
            userActivity.setLongestStreak(1);
            userActivity.setLastStreakDate(now);
        } else {
            // Check if this is a consecutive day
            LocalDate today = now.toLocalDate();
            LocalDate lastDate = lastStreakDate.toLocalDate();
            LocalDate yesterday = today.minusDays(1);

            if (lastDate.equals(today)) {
                // Already counted today, no change
            } else if (lastDate.equals(yesterday)) {
                // Consecutive day, increment streak
                userActivity.setCurrentStreak(userActivity.getCurrentStreak() + 1);
                userActivity.setLastStreakDate(now);

                // Update longest streak if needed
                if (userActivity.getCurrentStreak() > userActivity.getLongestStreak()) {
                    userActivity.setLongestStreak(userActivity.getCurrentStreak());
                }
            } else {
                // Streak broken, reset to 1
                userActivity.setCurrentStreak(1);
                userActivity.setLastStreakDate(now);
            }
        }
    }

    /**
     * Check if we should unlock an insight and do so if needed
     */
    private void checkAndUnlockInsight(String userId) {
        UserActivity userActivity = getOrCreateUserActivity(userId);

        // Unlock an insight every 5 completed challenges
        if (userActivity.getTotalChallengesCompleted() % 5 == 0) {
            unlockInsight(userId);
        }
    }

    /**
     * Unlock a new insight for the user
     */
    private void unlockInsight(String userId) {
        // Get locked insights
        List<Insight> lockedInsights = insightRepository.findByUserIdAndIsUnlockedFalse(userId);

        // If no locked insights, create some
        if (lockedInsights.isEmpty()) {
            lockedInsights = createDefaultInsights(userId);
        }

        // Select a random insight to unlock
        if (!lockedInsights.isEmpty()) {
            Insight insightToUnlock = lockedInsights.get(new Random().nextInt(lockedInsights.size()));
            insightToUnlock.setUnlocked(true);
            insightToUnlock.setCreatedAt(LocalDateTime.now());
            insightRepository.save(insightToUnlock);

            // Update user activity
            UserActivity userActivity = getOrCreateUserActivity(userId);
            userActivity.setInsightsUnlocked(userActivity.getInsightsUnlocked() + 1);
            userActivityRepository.save(userActivity);
        }
    }

    /**
     * Create default insights for a user
     */
    private List<Insight> createDefaultInsights(String userId) {
        List<Insight> insights = Arrays.asList(
            Insight.builder()
                .id(UUID.randomUUID().toString())
                .title("Your Growth Journey")
                .content("Consistent small steps lead to meaningful progress. Keep going!")
                .source("Daily Boost")
                .category("general")
                .userId(userId)
                .isUnlocked(false)
                .build(),

            Insight.builder()
                .id(UUID.randomUUID().toString())
                .title("Self-Understanding")
                .content("Regular self-assessment helps track your mental wellbeing. Keep checking in with yourself.")
                .source("Mental Health Quiz")
                .category("quiz")
                .userId(userId)
                .isUnlocked(false)
                .build(),

            Insight.builder()
                .id(UUID.randomUUID().toString())
                .title("Emotional Patterns")
                .content("Your mood tends to improve after journaling. Consider making it a regular practice.")
                .source("Mood Tracker")
                .category("mood")
                .userId(userId)
                .isUnlocked(false)
                .build(),

            Insight.builder()
                .id(UUID.randomUUID().toString())
                .title("Productivity Insight")
                .content("You complete more tasks when you break them into smaller steps. Try this approach more often.")
                .source("To-Do List")
                .category("todo")
                .userId(userId)
                .isUnlocked(false)
                .build(),

            Insight.builder()
                .id(UUID.randomUUID().toString())
                .title("Mindfulness Impact")
                .content("Regular meditation sessions correlate with improved mood scores in your tracking data.")
                .source("Meditation")
                .category("meditation")
                .userId(userId)
                .isUnlocked(false)
                .build()
        );

        return insightRepository.saveAll(insights);
    }

    /**
     * Get unlocked insights for a user
     */
    public List<InsightDTO> getInsights(String userId) {
        List<Insight> insights = insightRepository.findByUserIdAndIsUnlockedTrue(userId);

        return insights.stream()
                .map(this::convertToInsightDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get daily boost stats for a user
     */
    public DailyBoostStatsDTO getStats(String userId) {
        UserActivity userActivity = getOrCreateUserActivity(userId);

        // Get challenges completed today
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        List<DailyChallenge> completedToday = challengeRepository
                .findByUserIdAndCompletedTrueAndCompletedAtAfter(userId, startOfDay);

        // Calculate completion percentage
        List<DailyChallenge> allActiveChallenges = challengeRepository
                .findByUserIdAndCompletedFalseAndExpiresAtAfter(userId, LocalDateTime.now());
        allActiveChallenges.addAll(completedToday);

        int completionPercentage = 0;
        if (!allActiveChallenges.isEmpty()) {
            completionPercentage = (int) Math.round((double) completedToday.size() / allActiveChallenges.size() * 100);
        }

        // Get challenge IDs completed today
        List<String> completedTodayIds = completedToday.stream()
                .map(DailyChallenge::getId)
                .collect(Collectors.toList());

        return DailyBoostStatsDTO.builder()
                .streak(userActivity.getCurrentStreak())
                .completionPercentage(completionPercentage)
                .insightsCount(userActivity.getInsightsUnlocked())
                .totalChallengesCompleted(userActivity.getTotalChallengesCompleted())
                .completedToday(completedTodayIds)
                .build();
    }

    /**
     * Convert DailyChallenge to DTO
     */
    private DailyChallengeDTO convertToDTO(DailyChallenge challenge) {
        return DailyChallengeDTO.builder()
                .id(challenge.getId())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .category(challenge.getCategory())
                .difficulty(challenge.getDifficulty())
                .link(challenge.getLink())
                .completed(challenge.isCompleted())
                .progress(challenge.getProgress())
                .createdAt(challenge.getCreatedAt())
                .completedAt(challenge.getCompletedAt())
                .expiresAt(challenge.getExpiresAt())
                .build();
    }

    /**
     * Convert Insight to DTO
     */
    private InsightDTO convertToInsightDTO(Insight insight) {
        return InsightDTO.builder()
                .id(insight.getId())
                .title(insight.getTitle())
                .content(insight.getContent())
                .source(insight.getSource())
                .category(insight.getCategory())
                .createdAt(insight.getCreatedAt())
                .isUnlocked(insight.isUnlocked())
                .build();
    }

    /**
     * Convert UserActivity to DTO
     */
    private UserActivityDTO convertToUserActivityDTO(UserActivity activity) {
        return UserActivityDTO.builder()
                .id(activity.getId())
                .userId(activity.getUserId())
                .lastJournalDate(activity.getLastJournalDate())
                .lastQuizDate(activity.getLastQuizDate())
                .lastMeditationDate(activity.getLastMeditationDate())
                .lastMoodEntryDate(activity.getLastMoodEntryDate())
                .lastTodoCompletionDate(activity.getLastTodoCompletionDate())
                .lastPlaylistDate(activity.getLastPlaylistDate())
                .currentStreak(activity.getCurrentStreak())
                .longestStreak(activity.getLongestStreak())
                .lastStreakDate(activity.getLastStreakDate())
                .totalChallengesCompleted(activity.getTotalChallengesCompleted())
                .insightsUnlocked(activity.getInsightsUnlocked())
                .activityCounts(activity.getActivityCounts())
                .updatedAt(activity.getUpdatedAt())
                .build();
    }
}
