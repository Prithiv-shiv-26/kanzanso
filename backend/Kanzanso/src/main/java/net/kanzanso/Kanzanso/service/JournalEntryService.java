package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.JournalEntryDTO;
import net.kanzanso.Kanzanso.model.JournalEntry;
import net.kanzanso.Kanzanso.model.User;
import net.kanzanso.Kanzanso.repository.JournalEntryRepository;
import net.kanzanso.Kanzanso.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JournalEntryService {

    private final JournalEntryRepository journalEntryRepository;
    private final UserRepository userRepository;

    @Autowired
    public JournalEntryService(JournalEntryRepository journalEntryRepository, UserRepository userRepository) {
        this.journalEntryRepository = journalEntryRepository;
        this.userRepository = userRepository;
    }

    public JournalEntryDTO createJournalEntry(String userId, JournalEntryDTO journalEntryDTO) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Create new journal entry
        JournalEntry journalEntry = JournalEntry.builder()
                .title(journalEntryDTO.getTitle())
                .content(journalEntryDTO.getContent())
                .mood(journalEntryDTO.getMood())
                .weather(journalEntryDTO.getWeather())
                .motivationLevel(journalEntryDTO.getMotivationLevel())
                .gratitude(journalEntryDTO.getGratitude())
                .customFields(journalEntryDTO.getCustomFields())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .userId(userId)
                .build();

        JournalEntry savedJournalEntry = journalEntryRepository.save(journalEntry);

        // Update user's journalEntryIds list
        user.getJournalEntryIds().add(savedJournalEntry.getId());
        userRepository.save(user);

        return convertToDTO(savedJournalEntry);
    }

    public List<JournalEntryDTO> getJournalEntriesByUserId(String userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        return journalEntryRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<JournalEntryDTO> getJournalEntriesByUserIdAndMood(String userId, String mood) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        return journalEntryRepository.findByUserIdAndMood(userId, mood).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<JournalEntryDTO> getJournalEntriesByUserIdAndDateRange(String userId, LocalDateTime start, LocalDateTime end) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        return journalEntryRepository.findByUserIdAndCreatedAtBetween(userId, start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public JournalEntryDTO getJournalEntryById(String userId, String journalEntryId) {
        JournalEntry journalEntry = journalEntryRepository.findById(journalEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Journal entry not found"));

        // Verify the journal entry belongs to the user
        if (!journalEntry.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Journal entry does not belong to the user");
        }

        return convertToDTO(journalEntry);
    }

    public JournalEntryDTO updateJournalEntry(String userId, String journalEntryId, JournalEntryDTO journalEntryDTO) {
        JournalEntry journalEntry = journalEntryRepository.findById(journalEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Journal entry not found"));

        // Verify the journal entry belongs to the user
        if (!journalEntry.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Journal entry does not belong to the user");
        }

        // Update journal entry fields
        journalEntry.setTitle(journalEntryDTO.getTitle());
        journalEntry.setContent(journalEntryDTO.getContent());
        journalEntry.setMood(journalEntryDTO.getMood());
        journalEntry.setWeather(journalEntryDTO.getWeather());
        journalEntry.setMotivationLevel(journalEntryDTO.getMotivationLevel());
        journalEntry.setGratitude(journalEntryDTO.getGratitude());
        journalEntry.setCustomFields(journalEntryDTO.getCustomFields());
        journalEntry.setUpdatedAt(LocalDateTime.now());

        JournalEntry updatedJournalEntry = journalEntryRepository.save(journalEntry);

        return convertToDTO(updatedJournalEntry);
    }

    public void deleteJournalEntry(String userId, String journalEntryId) {
        JournalEntry journalEntry = journalEntryRepository.findById(journalEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Journal entry not found"));

        // Verify the journal entry belongs to the user
        if (!journalEntry.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Journal entry does not belong to the user");
        }

        // Remove the journal entry ID from the user's journalEntryIds list
        User user = userRepository.findById(userId).orElseThrow();
        user.getJournalEntryIds().remove(journalEntryId);
        userRepository.save(user);

        // Delete the journal entry
        journalEntryRepository.deleteById(journalEntryId);
    }

    // Helper method to convert JournalEntry to JournalEntryDTO
    private JournalEntryDTO convertToDTO(JournalEntry journalEntry) {
        return JournalEntryDTO.builder()
                .id(journalEntry.getId())
                .title(journalEntry.getTitle())
                .content(journalEntry.getContent())
                .mood(journalEntry.getMood())
                .weather(journalEntry.getWeather())
                .motivationLevel(journalEntry.getMotivationLevel())
                .gratitude(journalEntry.getGratitude())
                .customFields(journalEntry.getCustomFields())
                .createdAt(journalEntry.getCreatedAt())
                .updatedAt(journalEntry.getUpdatedAt())
                .build();
    }
}