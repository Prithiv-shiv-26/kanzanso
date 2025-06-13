package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.Playlist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends MongoRepository<Playlist, String> {
    List<Playlist> findByUserId(String userId);
    List<Playlist> findByUserIdAndMood(String userId, String mood);
    Optional<Playlist> findByUserIdAndSpotifyPlaylistId(String userId, String spotifyPlaylistId);
    void deleteByUserId(String userId);
}