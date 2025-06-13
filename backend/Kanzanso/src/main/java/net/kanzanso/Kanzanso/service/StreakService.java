package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.StreakDTO;
import net.kanzanso.Kanzanso.model.Streak;
import net.kanzanso.Kanzanso.model.User;
import net.kanzanso.Kanzanso.repository.StreakRepository;
import net.kanzanso.Kanzanso.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StreakService {

    private final StreakRepository streakRepository;
    private final UserRepository userRepository;

    @Autowired
    public StreakService(StreakRepository streakRepository, UserRepository userRepository) {
        this.streakRepository = streakRepository;
        this.userRepository = userRepository;
    }

    public StreakDTO createStreak(String userId, StreakDTO streakDTO) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Create new streak
        Streak streak = Streak.builder()
                .name(streakDTO.getName())
                .description(streakDTO.getDescription())
                .currentCount(0)
                .highestCount(0)
                .type(streakDTO.getType())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .userId(userId)
                .build();

        Streak savedStreak = streakRepository.save(streak);

        // Update user's streakIds list
        user.getStreakIds().add(savedStreak.getId());
        userRepository.save(user);

        return convertToDTO(savedStreak);
    }

    public List<StreakDTO> getStreaksByUserId(String userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        return streakRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StreakDTO> getStreaksByUserIdAndType(String userId, String type) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        return streakRepository.findByUserIdAndType(userId, type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StreakDTO getStreakById(String userId, String streakId) {
        Streak streak = streakRepository.findById(streakId)
                .orElseThrow(() -> new IllegalArgumentException("Streak not found"));

        // Verify the streak belongs to the user
        if (!streak.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Streak does not belong to the user");
        }

        return convertToDTO(streak);
    }

    public StreakDTO updateStreak(String userId, String streakId, StreakDTO streakDTO) {
        Streak streak = streakRepository.findById(streakId)
                .orElseThrow(() -> new IllegalArgumentException("Streak not found"));

        // Verify the streak belongs to the user
        if (!streak.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Streak does not belong to the user");
        }

        // Update streak fields
        streak.setName(streakDTO.getName());
        streak.setDescription(streakDTO.getDescription());
        streak.setType(streakDTO.getType());
        streak.setUpdatedAt(LocalDateTime.now());

        Streak updatedStreak = streakRepository.save(streak);

        return convertToDTO(updatedStreak);
    }

    public StreakDTO completeStreakForToday(String userId, String streakId) {
        Streak streak = streakRepository.findById(streakId)
                .orElseThrow(() -> new IllegalArgumentException("Streak not found"));

        // Verify the streak belongs to the user
        if (!streak.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Streak does not belong to the user");
        }

        LocalDate today = LocalDate.now();

        // Check if already completed today
        if (streak.getLastCompletedDate() != null && streak.getLastCompletedDate().equals(today)) {
            return convertToDTO(streak); // Already completed today, no changes needed
        }

        // Check if this continues the streak (completed yesterday)
        boolean continuesStreak = streak.getLastCompletedDate() != null && 
                streak.getLastCompletedDate().equals(today.minusDays(1));

        if (continuesStreak) {
            // Increment current streak count
            streak.setCurrentCount(streak.getCurrentCount() + 1);
            
            // Update highest count if needed
            if (streak.getCurrentCount() > streak.getHighestCount()) {
                streak.setHighestCount(streak.getCurrentCount());
            }
        } else {
            // Reset current streak count to 1 (starting a new streak)
            streak.setCurrentCount(1);
            
            // If this is the first time, set highest count to 1
            if (streak.getHighestCount() == 0) {
                streak.setHighestCount(1);
            }
        }

        // Add today to streak dates
        streak.getStreakDates().add(today);
        streak.setLastCompletedDate(today);
        streak.setUpdatedAt(LocalDateTime.now());

        Streak updatedStreak = streakRepository.save(streak);

        return convertToDTO(updatedStreak);
    }

    public void deleteStreak(String userId, String streakId) {
        Streak streak = streakRepository.findById(streakId)
                .orElseThrow(() -> new IllegalArgumentException("Streak not found"));

        // Verify the streak belongs to the user
        if (!streak.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Streak does not belong to the user");
        }

        // Remove the streak ID from the user's streakIds list
        User user = userRepository.findById(userId).orElseThrow();
        user.getStreakIds().remove(streakId);
        userRepository.save(user);

        // Delete the streak
        streakRepository.deleteById(streakId);
    }

    // Helper method to convert Streak to StreakDTO
    private StreakDTO convertToDTO(Streak streak) {
        return StreakDTO.builder()
                .id(streak.getId())
                .name(streak.getName())
                .description(streak.getDescription())
                .currentCount(streak.getCurrentCount())
                .highestCount(streak.getHighestCount())
                .streakDates(streak.getStreakDates())
                .type(streak.getType())
                .createdAt(streak.getCreatedAt())
                .updatedAt(streak.getUpdatedAt())
                .lastCompletedDate(streak.getLastCompletedDate())
                .build();
    }
}