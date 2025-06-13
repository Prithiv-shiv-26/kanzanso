package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.PlaylistDTO;
import net.kanzanso.Kanzanso.model.Playlist;
import net.kanzanso.Kanzanso.model.User;
import net.kanzanso.Kanzanso.repository.PlaylistRepository;
import net.kanzanso.Kanzanso.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final UserRepository userRepository;
    private final SpotifyService spotifyService;

    @Autowired
    public PlaylistService(PlaylistRepository playlistRepository, UserRepository userRepository, SpotifyService spotifyService) {
        this.playlistRepository = playlistRepository;
        this.userRepository = userRepository;
        this.spotifyService = spotifyService;
    }

    public PlaylistDTO createPlaylist(String userId, PlaylistDTO playlistDTO) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Create new playlist
        Playlist playlist = Playlist.builder()
                .name(playlistDTO.getName())
                .mood(playlistDTO.getMood())
                .spotifyPlaylistId(playlistDTO.getSpotifyPlaylistId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .userId(userId)
                .build();

        // If tracks are provided, add them
        if (playlistDTO.getTracks() != null && !playlistDTO.getTracks().isEmpty()) {
            playlist.setTracks(playlistDTO.getTracks().stream()
                    .map(this::convertToTrackModel)
                    .collect(Collectors.toList()));
        }

        Playlist savedPlaylist = playlistRepository.save(playlist);

        // Update user's playlistIds list
        user.getPlaylistIds().add(savedPlaylist.getId());
        userRepository.save(user);

        return convertToDTO(savedPlaylist);
    }

    public PlaylistDTO createPlaylistFromMood(String userId, String mood, String name) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Get Spotify playlist for the mood
        se.michaelthelin.spotify.model_objects.specification.Playlist spotifyPlaylist = spotifyService.getPlaylistByMood(mood);
        
        // Get tracks from the Spotify playlist
        List<Playlist.Track> tracks = spotifyService.getTracksFromPlaylist(spotifyPlaylist.getId());

        // Create new playlist
        Playlist playlist = Playlist.builder()
                .name(name != null && !name.isEmpty() ? name : mood + " Playlist")
                .mood(mood)
                .spotifyPlaylistId(spotifyPlaylist.getId())
                .tracks(tracks)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .userId(userId)
                .build();

        Playlist savedPlaylist = playlistRepository.save(playlist);

        // Update user's playlistIds list
        user.getPlaylistIds().add(savedPlaylist.getId());
        userRepository.save(user);

        return convertToDTO(savedPlaylist);
    }

    public List<PlaylistDTO> getPlaylistsByUserId(String userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        return playlistRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PlaylistDTO> getPlaylistsByUserIdAndMood(String userId, String mood) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        return playlistRepository.findByUserIdAndMood(userId, mood).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PlaylistDTO getPlaylistById(String userId, String playlistId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found"));

        // Verify the playlist belongs to the user
        if (!playlist.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Playlist does not belong to the user");
        }

        return convertToDTO(playlist);
    }

    public PlaylistDTO updatePlaylist(String userId, String playlistId, PlaylistDTO playlistDTO) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found"));

        // Verify the playlist belongs to the user
        if (!playlist.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Playlist does not belong to the user");
        }

        // Update playlist fields
        playlist.setName(playlistDTO.getName());
        playlist.setMood(playlistDTO.getMood());
        playlist.setUpdatedAt(LocalDateTime.now());

        // Update tracks if provided
        if (playlistDTO.getTracks() != null) {
            playlist.setTracks(playlistDTO.getTracks().stream()
                    .map(this::convertToTrackModel)
                    .collect(Collectors.toList()));
        }

        Playlist updatedPlaylist = playlistRepository.save(playlist);

        return convertToDTO(updatedPlaylist);
    }

    public void deletePlaylist(String userId, String playlistId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found"));

        // Verify the playlist belongs to the user
        if (!playlist.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Playlist does not belong to the user");
        }

        // Remove the playlist ID from the user's playlistIds list
        User user = userRepository.findById(userId).orElseThrow();
        user.getPlaylistIds().remove(playlistId);
        userRepository.save(user);

        // Delete the playlist
        playlistRepository.deleteById(playlistId);
    }

    public List<String> getAvailableMoods() {
        return spotifyService.getAvailableMoods();
    }

    // Helper method to convert Playlist to PlaylistDTO
    private PlaylistDTO convertToDTO(Playlist playlist) {
        List<PlaylistDTO.TrackDTO> trackDTOs = playlist.getTracks().stream()
                .map(this::convertToTrackDTO)
                .collect(Collectors.toList());

        return PlaylistDTO.builder()
                .id(playlist.getId())
                .name(playlist.getName())
                .mood(playlist.getMood())
                .spotifyPlaylistId(playlist.getSpotifyPlaylistId())
                .tracks(trackDTOs)
                .createdAt(playlist.getCreatedAt())
                .updatedAt(playlist.getUpdatedAt())
                .build();
    }

    // Helper method to convert TrackDTO to Track model
    private Playlist.Track convertToTrackModel(PlaylistDTO.TrackDTO trackDTO) {
        return Playlist.Track.builder()
                .trackId(trackDTO.getTrackId())
                .name(trackDTO.getName())
                .artist(trackDTO.getArtist())
                .albumArt(trackDTO.getAlbumArt())
                .spotifyUri(trackDTO.getSpotifyUri())
                .build();
    }

    // Helper method to convert Track model to TrackDTO
    private PlaylistDTO.TrackDTO convertToTrackDTO(Playlist.Track track) {
        return PlaylistDTO.TrackDTO.builder()
                .trackId(track.getTrackId())
                .name(track.getName())
                .artist(track.getArtist())
                .albumArt(track.getAlbumArt())
                .spotifyUri(track.getSpotifyUri())
                .build();
    }
}