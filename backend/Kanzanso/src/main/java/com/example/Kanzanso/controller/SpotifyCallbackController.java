package com.example.Kanzanso.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

/**
 * Controller to handle Spotify OAuth callback
 * This controller receives the callback from Spotify and redirects to the frontend
 */
@Controller
@RequestMapping("/api/spotify")
public class SpotifyCallbackController {

    @Value("${frontend.url}")
    private String frontendUrl;

    /**
     * Handle the callback from Spotify
     * @param code The authorization code from Spotify
     * @param error Any error from Spotify
     * @return Redirect to the frontend with the code or error
     */
    @GetMapping("/callback")
    public RedirectView callback(@RequestParam(required = false) String code,
                                 @RequestParam(required = false) String error) {
        
        // Default to the playlist page
        String redirectUrl = frontendUrl + "/playlist/callback.html";
        
        // Add code or error as query parameters
        if (code != null && !code.isEmpty()) {
            redirectUrl += "?code=" + code;
        } else if (error != null && !error.isEmpty()) {
            redirectUrl += "?error=" + error;
        }
        
        return new RedirectView(redirectUrl);
    }
}
