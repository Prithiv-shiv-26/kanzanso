package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.dto.PlaylistDTO;
import net.kanzanso.Kanzanso.service.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController extends BaseController {

    private final PlaylistService playlistService;

    @Autowired
    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @PostMapping
    public ResponseEntity<PlaylistDTO> createPlaylist(@Valid @RequestBody PlaylistDTO playlistDTO, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            PlaylistDTO createdPlaylist = playlistService.createPlaylist(userId, playlistDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPlaylist);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/mood")
    public ResponseEntity<PlaylistDTO> createPlaylistFromMood(
            @RequestParam String mood,
            @RequestParam(required = false) String name,
            HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            PlaylistDTO createdPlaylist = playlistService.createPlaylistFromMood(userId, mood, name);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPlaylist);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating playlist from mood: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<PlaylistDTO>> getPlaylists(HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            List<PlaylistDTO> playlists = playlistService.getPlaylistsByUserId(userId);
            return ResponseEntity.ok(playlists);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/mood/{mood}")
    public ResponseEntity<List<PlaylistDTO>> getPlaylistsByMood(@PathVariable String mood, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            List<PlaylistDTO> playlists = playlistService.getPlaylistsByUserIdAndMood(userId, mood);
            return ResponseEntity.ok(playlists);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/moods")
    public ResponseEntity<List<String>> getAvailableMoods() {
        List<String> moods = playlistService.getAvailableMoods();
        return ResponseEntity.ok(moods);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlaylistDTO> getPlaylistById(@PathVariable String id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            PlaylistDTO playlist = playlistService.getPlaylistById(userId, id);
            return ResponseEntity.ok(playlist);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlaylistDTO> updatePlaylist(@PathVariable String id, @Valid @RequestBody PlaylistDTO playlistDTO, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            PlaylistDTO updatedPlaylist = playlistService.updatePlaylist(userId, id, playlistDTO);
            return ResponseEntity.ok(updatedPlaylist);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable String id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            playlistService.deletePlaylist(userId, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}