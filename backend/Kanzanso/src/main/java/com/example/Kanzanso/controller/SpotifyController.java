package com.example.Kanzanso.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/spotify")
public class SpotifyController {

    @Value("${spotify.client.id}")
    private String clientId;

    @Value("${spotify.client.secret}")
    private String clientSecret;

    @Value("${spotify.redirect.uri}")
    private String redirectUri;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
    private final String SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com/api/token";

    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> getAuthorizationUrl() {
        String scopes = "streaming user-read-email user-read-private user-modify-playback-state " +
                "user-read-playback-state user-library-read user-library-modify " +
                "playlist-read-private playlist-read-collaborative";

        String authUrl = UriComponentsBuilder.fromHttpUrl("https://accounts.spotify.com/authorize")
                .queryParam("client_id", clientId)
                .queryParam("response_type", "code")
                .queryParam("redirect_uri", redirectUri)
                .queryParam("scope", scopes)
                .queryParam("show_dialog", true)
                .build().toUriString();

        Map<String, String> response = new HashMap<>();
        response.put("authUrl", authUrl);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/token")
    public ResponseEntity<Object> getToken(@RequestParam String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        String auth = clientId + ":" + clientSecret;
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes());
        headers.set("Authorization", "Basic " + new String(encodedAuth));

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "authorization_code");
        map.add("code", code);
        map.add("redirect_uri", redirectUri);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Object> response = restTemplate.postForEntity(
                    SPOTIFY_ACCOUNTS_URL, 
                    request, 
                    Object.class);
            
            return response;
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<Object> refreshToken(@RequestParam String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        String auth = clientId + ":" + clientSecret;
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes());
        headers.set("Authorization", "Basic " + new String(encodedAuth));

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "refresh_token");
        map.add("refresh_token", refreshToken);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Object> response = restTemplate.postForEntity(
                    SPOTIFY_ACCOUNTS_URL, 
                    request, 
                    Object.class);
            
            return response;
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to refresh token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<Object> getRecommendations(
            @RequestParam(required = false) String seed_artists,
            @RequestParam(required = false) String seed_genres,
            @RequestParam(required = false) String seed_tracks,
            @RequestParam(required = false, defaultValue = "20") int limit,
            @RequestParam(required = false) Double target_energy,
            @RequestParam(required = false) Double target_valence,
            @RequestParam(required = false) Double min_tempo,
            @RequestParam(required = false) Double max_tempo,
            @RequestParam(required = false) Double target_instrumentalness,
            @RequestParam(required = false) Double target_acousticness,
            @RequestHeader("Authorization") String authHeader) {
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(SPOTIFY_API_BASE_URL + "/recommendations")
                .queryParam("limit", limit);
        
        if (seed_artists != null) builder.queryParam("seed_artists", seed_artists);
        if (seed_genres != null) builder.queryParam("seed_genres", seed_genres);
        if (seed_tracks != null) builder.queryParam("seed_tracks", seed_tracks);
        if (target_energy != null) builder.queryParam("target_energy", target_energy);
        if (target_valence != null) builder.queryParam("target_valence", target_valence);
        if (min_tempo != null) builder.queryParam("min_tempo", min_tempo);
        if (max_tempo != null) builder.queryParam("max_tempo", max_tempo);
        if (target_instrumentalness != null) builder.queryParam("target_instrumentalness", target_instrumentalness);
        if (target_acousticness != null) builder.queryParam("target_acousticness", target_acousticness);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    entity,
                    Object.class);
            
            return response;
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get recommendations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Object> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "track") String type,
            @RequestParam(defaultValue = "20") int limit,
            @RequestHeader("Authorization") String authHeader) {
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(SPOTIFY_API_BASE_URL + "/search")
                .queryParam("q", q)
                .queryParam("type", type)
                .queryParam("limit", limit);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    entity,
                    Object.class);
            
            return response;
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to search: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
