package net.kanzanso.Kanzanso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaylistDTO {
    private String id;
    
    @NotBlank(message = "Playlist name is required")
    @Size(min = 1, max = 100, message = "Playlist name must be between 1 and 100 characters")
    private String name;
    
    @Size(max = 50, message = "Mood cannot exceed 50 characters")
    private String mood;
    
    @Size(max = 100, message = "Spotify playlist ID cannot exceed 100 characters")
    private String spotifyPlaylistId;
    
    @Valid
    private List<TrackDTO> tracks = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrackDTO {
        @Size(max = 100, message = "Track ID cannot exceed 100 characters")
        private String trackId;
        
        @Size(max = 200, message = "Track name cannot exceed 200 characters")
        private String name;
        
        @Size(max = 200, message = "Artist name cannot exceed 200 characters")
        private String artist;
        
        @Size(max = 500, message = "Album art URL cannot exceed 500 characters")
        private String albumArt;
        
        @Size(max = 200, message = "Spotify URI cannot exceed 200 characters")
        private String spotifyUri;
    }
}