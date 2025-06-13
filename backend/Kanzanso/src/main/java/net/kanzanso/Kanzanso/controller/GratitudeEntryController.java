package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.dto.GratitudeEntryDTO;
import net.kanzanso.Kanzanso.dto.GratitudeStatsDTO;
import net.kanzanso.Kanzanso.service.GratitudeEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/gratitude")
public class GratitudeEntryController extends BaseController {

    private final GratitudeEntryService gratitudeEntryService;

    @Autowired
    public GratitudeEntryController(GratitudeEntryService gratitudeEntryService) {
        this.gratitudeEntryService = gratitudeEntryService;
    }

    @GetMapping
    public ResponseEntity<List<GratitudeEntryDTO>> getAllEntries(@RequestParam String userId) {
        return ResponseEntity.ok(gratitudeEntryService.getAllEntriesByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GratitudeEntryDTO> getEntryById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(gratitudeEntryService.getEntryById(id));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/range")
    public ResponseEntity<List<GratitudeEntryDTO>> getEntriesByDateRange(
            @RequestParam String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(gratitudeEntryService.getEntriesByDateRange(userId, start, end));
    }

    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<GratitudeEntryDTO>> getEntriesByTag(
            @RequestParam String userId,
            @PathVariable String tag) {
        return ResponseEntity.ok(gratitudeEntryService.getEntriesByTag(userId, tag));
    }

    @GetMapping("/stats")
    public ResponseEntity<GratitudeStatsDTO> getGratitudeStats(@RequestParam String userId) {
        return ResponseEntity.ok(gratitudeEntryService.getGratitudeStats(userId));
    }

    @PostMapping
    public ResponseEntity<GratitudeEntryDTO> createEntry(@RequestBody GratitudeEntryDTO entryDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gratitudeEntryService.createEntry(entryDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GratitudeEntryDTO> updateEntry(@PathVariable String id, @RequestBody GratitudeEntryDTO entryDTO) {
        try {
            return ResponseEntity.ok(gratitudeEntryService.updateEntry(id, entryDTO));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable String id) {
        try {
            gratitudeEntryService.deleteEntry(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}
