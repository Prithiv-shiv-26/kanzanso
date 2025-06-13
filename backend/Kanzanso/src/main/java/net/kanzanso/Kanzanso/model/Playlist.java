package net.kanzanso.Kanzanso.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "playlists")
public class Playlist {
    @Id
    private String id;
    
    @NotBlank(message = "Playlist name is required")
    private String name;
    
    // Associated mood (e.g., "happy", "calm", "energetic", "sad")
    private String mood;
    
    // Spotify playlist ID (if using Spotify API)
    private String spotifyPlaylistId;
    
    // List of track IDs or track information
    private List<Track> tracks = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Reference to the user who owns this playlist
    private String userId;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Track {
        private String trackId;
        private String name;
        private String artist;
        private String albumArt;
        private String spotifyUri;
    }
}