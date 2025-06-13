package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.dto.StreakDTO;
import net.kanzanso.Kanzanso.service.StreakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/streaks")
public class StreakController extends BaseController {

    private final StreakService streakService;

    @Autowired
    public StreakController(StreakService streakService) {
        this.streakService = streakService;
    }

    @PostMapping
    public ResponseEntity<StreakDTO> createStreak(@Valid @RequestBody StreakDTO streakDTO, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            StreakDTO createdStreak = streakService.createStreak(userId, streakDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStreak);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<StreakDTO>> getStreaks(HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            List<StreakDTO> streaks = streakService.getStreaksByUserId(userId);
            return ResponseEntity.ok(streaks);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<StreakDTO>> getStreaksByType(@PathVariable String type, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            List<StreakDTO> streaks = streakService.getStreaksByUserIdAndType(userId, type);
            return ResponseEntity.ok(streaks);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<StreakDTO> getStreakById(@PathVariable String id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            StreakDTO streak = streakService.getStreakById(userId, id);
            return ResponseEntity.ok(streak);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<StreakDTO> updateStreak(@PathVariable String id, @Valid @RequestBody StreakDTO streakDTO, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            StreakDTO updatedStreak = streakService.updateStreak(userId, id, streakDTO);
            return ResponseEntity.ok(updatedStreak);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<StreakDTO> completeStreakForToday(@PathVariable String id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            StreakDTO updatedStreak = streakService.completeStreakForToday(userId, id);
            return ResponseEntity.ok(updatedStreak);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStreak(@PathVariable String id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            streakService.deleteStreak(userId, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}