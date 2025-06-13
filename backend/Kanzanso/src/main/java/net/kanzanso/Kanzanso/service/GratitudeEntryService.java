package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.GratitudeEntryDTO;
import net.kanzanso.Kanzanso.dto.GratitudeStatsDTO;
import net.kanzanso.Kanzanso.model.GratitudeEntry;
import net.kanzanso.Kanzanso.repository.GratitudeEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GratitudeEntryService {

    private final GratitudeEntryRepository gratitudeEntryRepository;

    @Autowired
    public GratitudeEntryService(GratitudeEntryRepository gratitudeEntryRepository) {
        this.gratitudeEntryRepository = gratitudeEntryRepository;
    }

    public List<GratitudeEntryDTO> getAllEntriesByUser(String userId) {
        return gratitudeEntryRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GratitudeEntryDTO getEntryById(String id) {
        return gratitudeEntryRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Gratitude entry not found with id: " + id));
    }

    public List<GratitudeEntryDTO> getEntriesByDateRange(String userId, LocalDateTime start, LocalDateTime end) {
        return gratitudeEntryRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GratitudeEntryDTO> getEntriesByTag(String userId, String tag) {
        return gratitudeEntryRepository.findByUserIdAndTagsContainingOrderByDateDesc(userId, tag).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GratitudeEntryDTO createEntry(GratitudeEntryDTO entryDTO) {
        GratitudeEntry entry = convertToEntity(entryDTO);
        if (entry.getDate() == null) {
            entry.setDate(LocalDateTime.now());
        }

        GratitudeEntry savedEntry = gratitudeEntryRepository.save(entry);
        return convertToDTO(savedEntry);
    }

    public GratitudeEntryDTO updateEntry(String id, GratitudeEntryDTO entryDTO) {
        Optional<GratitudeEntry> existingEntry = gratitudeEntryRepository.findById(id);
        if (existingEntry.isPresent()) {
            GratitudeEntry entry = existingEntry.get();
            entry.setContent(entryDTO.getContent());
            entry.setTags(entryDTO.getTags());

            GratitudeEntry updatedEntry = gratitudeEntryRepository.save(entry);
            return convertToDTO(updatedEntry);
        } else {
            throw new IllegalArgumentException("Gratitude entry not found with id: " + id);
        }
    }

    public void deleteEntry(String id) {
        if (gratitudeEntryRepository.existsById(id)) {
            gratitudeEntryRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Gratitude entry not found with id: " + id);
        }
    }

    public GratitudeStatsDTO getGratitudeStats(String userId) {
        // Get total entries
        long totalEntries = gratitudeEntryRepository.countByUserIdAndDateBetween(
                userId, LocalDateTime.MIN, LocalDateTime.MAX);

        // Get monthly entries
        LocalDateTime firstDayOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        long monthlyEntries = gratitudeEntryRepository.countByUserIdAndDateBetween(
                userId, firstDayOfMonth, LocalDateTime.now());

        // Calculate streak
        int currentStreak = calculateStreak(userId);

        return new GratitudeStatsDTO(totalEntries, currentStreak, monthlyEntries);
    }

    private int calculateStreak(String userId) {
        List<GratitudeEntry> allEntries = gratitudeEntryRepository.findByUserIdOrderByDateDesc(userId);
        if (allEntries.isEmpty()) {
            return 0;
        }

        // Check if there's an entry today
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(LocalTime.MAX);

        boolean hasEntryToday = allEntries.stream()
                .anyMatch(entry -> {
                    LocalDateTime entryDate = entry.getDate();
                    return entryDate.isAfter(startOfToday) && entryDate.isBefore(endOfToday);
                });

        // If no entry today, check if there was one yesterday
        if (!hasEntryToday) {
            LocalDate yesterday = today.minusDays(1);
            LocalDateTime startOfYesterday = yesterday.atStartOfDay();
            LocalDateTime endOfYesterday = yesterday.atTime(LocalTime.MAX);

            boolean hasEntryYesterday = allEntries.stream()
                    .anyMatch(entry -> {
                        LocalDateTime entryDate = entry.getDate();
                        return entryDate.isAfter(startOfYesterday) && entryDate.isBefore(endOfYesterday);
                    });

            if (!hasEntryYesterday) {
                return 0;
            }
        }

        // Get unique dates (one entry per day)
        List<LocalDate> uniqueDates = new ArrayList<>();
        for (GratitudeEntry entry : allEntries) {
            LocalDate entryDate = entry.getDate().toLocalDate();
            if (!uniqueDates.contains(entryDate)) {
                uniqueDates.add(entryDate);
            }
        }

        // Sort dates in descending order (newest first)
        uniqueDates.sort((a, b) -> b.compareTo(a));

        // Calculate streak
        int streak = 0;
        LocalDate currentDate = hasEntryToday ? today : today.minusDays(1);

        for (LocalDate date : uniqueDates) {
            if (date.equals(currentDate)) {
                streak++;
                currentDate = currentDate.minusDays(1);
            } else if (date.isBefore(currentDate)) {
                // We missed a day, streak is broken
                break;
            }
        }

        return streak;
    }

    // Helper methods to convert between DTO and Entity
    private GratitudeEntryDTO convertToDTO(GratitudeEntry entry) {
        return new GratitudeEntryDTO(
                entry.getId(),
                entry.getUserId(),
                entry.getContent(),
                entry.getTags(),
                entry.getDate()
        );
    }

    private GratitudeEntry convertToEntity(GratitudeEntryDTO entryDTO) {
        GratitudeEntry entry = new GratitudeEntry();
        entry.setId(entryDTO.getId());
        entry.setUserId(entryDTO.getUserId());
        entry.setContent(entryDTO.getContent());
        entry.setTags(entryDTO.getTags());
        entry.setDate(entryDTO.getDate());
        return entry;
    }
}
