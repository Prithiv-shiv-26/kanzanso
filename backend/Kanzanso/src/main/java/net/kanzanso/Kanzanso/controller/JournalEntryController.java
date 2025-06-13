package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.dto.JournalEntryDTO;
import net.kanzanso.Kanzanso.service.JournalEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/journal")
public class JournalEntryController extends BaseController {

    private final JournalEntryService journalEntryService;

    @Autowired
    public JournalEntryController(JournalEntryService journalEntryService) {
        this.journalEntryService = journalEntryService;
    }

    @PostMapping()
    public ResponseEntity<JournalEntryDTO> createJournalEntry(@Valid @RequestBody JournalEntryDTO journalEntryDTO, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            JournalEntryDTO createdJournalEntry = journalEntryService.createJournalEntry(userId, journalEntryDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdJournalEntry);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<JournalEntryDTO>> getJournalEntries(HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            List<JournalEntryDTO> journalEntries = journalEntryService.getJournalEntriesByUserId(userId);
            return ResponseEntity.ok(journalEntries);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/mood/{mood}")
    public ResponseEntity<List<JournalEntryDTO>> getJournalEntriesByMood(@PathVariable String mood, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            List<JournalEntryDTO> journalEntries = journalEntryService.getJournalEntriesByUserIdAndMood(userId, mood);
            return ResponseEntity.ok(journalEntries);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<JournalEntryDTO>> getJournalEntriesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            List<JournalEntryDTO> journalEntries = journalEntryService.getJournalEntriesByUserIdAndDateRange(userId, start, end);
            return ResponseEntity.ok(journalEntries);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalEntryDTO> getJournalEntryById(@PathVariable String id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            JournalEntryDTO journalEntry = journalEntryService.getJournalEntryById(userId, id);
            return ResponseEntity.ok(journalEntry);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<JournalEntryDTO> updateJournalEntry(@PathVariable String id, @Valid @RequestBody JournalEntryDTO journalEntryDTO, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            JournalEntryDTO updatedJournalEntry = journalEntryService.updateJournalEntry(userId, id, journalEntryDTO);
            return ResponseEntity.ok(updatedJournalEntry);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJournalEntry(@PathVariable String id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            journalEntryService.deleteJournalEntry(userId, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}