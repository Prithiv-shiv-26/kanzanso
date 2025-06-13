package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.MoodEntryDTO;
import net.kanzanso.Kanzanso.model.MoodEntry;
import net.kanzanso.Kanzanso.repository.MoodEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MoodEntryService {

    private final MoodEntryRepository moodEntryRepository;

    @Autowired
    public MoodEntryService(MoodEntryRepository moodEntryRepository) {
        this.moodEntryRepository = moodEntryRepository;
    }

    public List<MoodEntryDTO> getAllMoodEntriesByUser(String userId) {
        return moodEntryRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MoodEntryDTO getMoodEntryById(String id) {
        return moodEntryRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Mood entry not found with id: " + id));
    }

    public List<MoodEntryDTO> getMoodEntriesByDateRange(String userId, LocalDateTime start, LocalDateTime end) {
        return moodEntryRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MoodEntryDTO createMoodEntry(MoodEntryDTO moodEntryDTO) {
        // Check if there's already an entry for today
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        
        Optional<MoodEntry> existingEntry = moodEntryRepository.findByUserIdAndDateBetween(
                moodEntryDTO.getUserId(), startOfDay, endOfDay);
        
        if (existingEntry.isPresent()) {
            // Update existing entry
            MoodEntry entry = existingEntry.get();
            entry.setMood(moodEntryDTO.getMood());
            entry.setNote(moodEntryDTO.getNote());
            entry.setDate(LocalDateTime.now());
            
            MoodEntry updatedEntry = moodEntryRepository.save(entry);
            return convertToDTO(updatedEntry);
        } else {
            // Create new entry
            MoodEntry moodEntry = convertToEntity(moodEntryDTO);
            if (moodEntry.getDate() == null) {
                moodEntry.setDate(LocalDateTime.now());
            }
            
            MoodEntry savedEntry = moodEntryRepository.save(moodEntry);
            return convertToDTO(savedEntry);
        }
    }

    public MoodEntryDTO updateMoodEntry(String id, MoodEntryDTO moodEntryDTO) {
        Optional<MoodEntry> existingEntry = moodEntryRepository.findById(id);
        if (existingEntry.isPresent()) {
            MoodEntry entry = existingEntry.get();
            entry.setMood(moodEntryDTO.getMood());
            entry.setNote(moodEntryDTO.getNote());
            
            MoodEntry updatedEntry = moodEntryRepository.save(entry);
            return convertToDTO(updatedEntry);
        } else {
            throw new IllegalArgumentException("Mood entry not found with id: " + id);
        }
    }

    public void deleteMoodEntry(String id) {
        if (moodEntryRepository.existsById(id)) {
            moodEntryRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Mood entry not found with id: " + id);
        }
    }

    // Helper methods to convert between DTO and Entity
    private MoodEntryDTO convertToDTO(MoodEntry moodEntry) {
        return new MoodEntryDTO(
                moodEntry.getId(),
                moodEntry.getUserId(),
                moodEntry.getMood(),
                moodEntry.getNote(),
                moodEntry.getDate()
        );
    }

    private MoodEntry convertToEntity(MoodEntryDTO moodEntryDTO) {
        MoodEntry moodEntry = new MoodEntry();
        moodEntry.setId(moodEntryDTO.getId());
        moodEntry.setUserId(moodEntryDTO.getUserId());
        moodEntry.setMood(moodEntryDTO.getMood());
        moodEntry.setNote(moodEntryDTO.getNote());
        moodEntry.setDate(moodEntryDTO.getDate());
        return moodEntry;
    }
}
