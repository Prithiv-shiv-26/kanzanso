package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.dto.MoodEntryDTO;
import net.kanzanso.Kanzanso.service.MoodEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/moods")
public class MoodEntryController extends BaseController {

    private final MoodEntryService moodEntryService;

    @Autowired
    public MoodEntryController(MoodEntryService moodEntryService) {
        this.moodEntryService = moodEntryService;
    }

    @GetMapping
    public ResponseEntity<List<MoodEntryDTO>> getAllMoodEntries(@RequestParam String userId) {
        return ResponseEntity.ok(moodEntryService.getAllMoodEntriesByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MoodEntryDTO> getMoodEntryById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(moodEntryService.getMoodEntryById(id));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/range")
    public ResponseEntity<List<MoodEntryDTO>> getMoodEntriesByDateRange(
            @RequestParam String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(moodEntryService.getMoodEntriesByDateRange(userId, start, end));
    }

    @PostMapping
    public ResponseEntity<MoodEntryDTO> createMoodEntry(@RequestBody MoodEntryDTO moodEntryDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moodEntryService.createMoodEntry(moodEntryDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MoodEntryDTO> updateMoodEntry(@PathVariable String id, @RequestBody MoodEntryDTO moodEntryDTO) {
        try {
            return ResponseEntity.ok(moodEntryService.updateMoodEntry(id, moodEntryDTO));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMoodEntry(@PathVariable String id) {
        try {
            moodEntryService.deleteMoodEntry(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}
