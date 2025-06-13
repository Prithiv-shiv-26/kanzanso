package net.kanzanso.Kanzanso.service;

import se.michaelthelin.spotify.SpotifyApi;
import se.michaelthelin.spotify.exceptions.SpotifyWebApiException;
import se.michaelthelin.spotify.model_objects.credentials.ClientCredentials;
import se.michaelthelin.spotify.model_objects.specification.Paging;
import se.michaelthelin.spotify.model_objects.specification.Playlist;
import se.michaelthelin.spotify.model_objects.specification.PlaylistTrack;
import se.michaelthelin.spotify.model_objects.specification.Track;
import se.michaelthelin.spotify.requests.authorization.client_credentials.ClientCredentialsRequest;
import org.apache.hc.core5.http.ParseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SpotifyService {

    @Value("${spotify.client.id:your-client-id}")
    private String clientId;

    @Value("${spotify.client.secret:your-client-secret}")
    private String clientSecret;

    private SpotifyApi spotifyApi;
    private long tokenExpirationTime;

    // Map of moods to Spotify playlist IDs
    private final Map<String, String> moodPlaylists = new HashMap<>();

    @PostConstruct
    public void init() {
        spotifyApi = new SpotifyApi.Builder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .build();

        // Initialize mood playlists map with some default playlists
        // These are example playlist IDs - you should replace them with actual Spotify playlist IDs
        moodPlaylists.put("happy", "37i9dQZF1DX3rxVfibe1L0");
        moodPlaylists.put("calm", "37i9dQZF1DX1s9knjP51Oa");
        moodPlaylists.put("energetic", "37i9dQZF1DX76Wlfdnj7AP");
        moodPlaylists.put("sad", "37i9dQZF1DX7qK8ma5wgG1");
        moodPlaylists.put("focus", "37i9dQZF1DX8NTLI2TtZa6");
        moodPlaylists.put("sleep", "37i9dQZF1DWZd79rJ6a7lp");
    }

    private void refreshAccessToken() {
        try {
            if (System.currentTimeMillis() > tokenExpirationTime) {
                ClientCredentialsRequest clientCredentialsRequest = spotifyApi.clientCredentials().build();
                ClientCredentials clientCredentials = clientCredentialsRequest.execute();
                
                spotifyApi.setAccessToken(clientCredentials.getAccessToken());
                tokenExpirationTime = System.currentTimeMillis() + (clientCredentials.getExpiresIn() * 1000);
            }
        } catch (IOException | SpotifyWebApiException | ParseException e) {
            throw new RuntimeException("Error refreshing Spotify access token", e);
        }
    }

    public Playlist getPlaylistByMood(String mood) {
        refreshAccessToken();
        
        String playlistId = moodPlaylists.getOrDefault(mood.toLowerCase(), moodPlaylists.get("calm"));
        
        try {
            return spotifyApi.getPlaylist(playlistId).build().execute();
        } catch (IOException | SpotifyWebApiException | ParseException e) {
            throw new RuntimeException("Error fetching Spotify playlist", e);
        }
    }

    public List<net.kanzanso.Kanzanso.model.Playlist.Track> getTracksFromPlaylist(String playlistId) {
        refreshAccessToken();
        
        try {
            Paging<PlaylistTrack> playlistTracks = spotifyApi.getPlaylistsItems(playlistId).build().execute();
            List<net.kanzanso.Kanzanso.model.Playlist.Track> tracks = new ArrayList<>();
            
            for (PlaylistTrack playlistTrack : playlistTracks.getItems()) {
                if (playlistTrack.getTrack() instanceof Track) {
                    Track track = (Track) playlistTrack.getTrack();
                    
                    net.kanzanso.Kanzanso.model.Playlist.Track trackModel = net.kanzanso.Kanzanso.model.Playlist.Track.builder()
                            .trackId(track.getId())
                            .name(track.getName())
                            .artist(track.getArtists()[0].getName())
                            .albumArt(track.getAlbum().getImages()[0].getUrl())
                            .spotifyUri(track.getUri())
                            .build();
                    
                    tracks.add(trackModel);
                }
            }
            
            return tracks;
        } catch (IOException | SpotifyWebApiException | ParseException e) {
            throw new RuntimeException("Error fetching tracks from Spotify playlist", e);
        }
    }

    public List<String> getAvailableMoods() {
        return new ArrayList<>(moodPlaylists.keySet());
    }
}