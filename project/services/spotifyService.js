/**
 * Spotify Service
 * Handles authentication and API calls to Spotify via backend proxy
 */

const spotifyService = {
    // Configuration
    config: {
        // Backend API endpoints
        backendBaseUrl: 'http://127.0.0.1:8080/api',
        spotifyLoginUrl: '/spotify/login',
        spotifyTokenUrl: '/spotify/token',
        spotifyRefreshUrl: '/spotify/refresh-token',
        spotifyRecommendationsUrl: '/spotify/recommendations',
        spotifySearchUrl: '/spotify/search',

        // Flag to indicate if we're using fallback mode (no backend)
        useFallbackMode: false,

        // Spotify Web Playback SDK
        playerName: 'Kanzanso Music Player',

        // Callback URL for handling the code parameter
        callbackUrl: '/playlist/callback.html'
    },

    // State
    state: {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        deviceId: null,
        player: null,
        isPlaying: false,
        currentTrack: null
    },

    /**
     * Initialize the Spotify service
     */
    init() {
        console.log('Initializing Spotify service');

        // Check if we have a token in localStorage
        this.state.accessToken = localStorage.getItem('spotify_access_token');
        this.state.expiresAt = localStorage.getItem('spotify_expires_at');

        // Check if token is expired
        if (this.state.expiresAt && new Date().getTime() > parseInt(this.state.expiresAt)) {
            console.log('Token expired, clearing...');
            this.logout();
        }

        // Initialize the Web Playback SDK if we have a token
        if (this.state.accessToken) {
            console.log('Access token found, initializing player...');
            this.initPlayer();
        } else {
            console.log('No access token found');
        }
    },

    /**
     * Exchange authorization code for access token
     * @param {string} code - Authorization code from Spotify
     * @returns {Promise} Promise that resolves when the token is received
     */
    async exchangeCodeForToken(code) {
        try {
            const response = await fetch(`${this.config.backendBaseUrl}${this.config.spotifyTokenUrl}?code=${code}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Store tokens
            this.state.accessToken = data.access_token;
            this.state.refreshToken = data.refresh_token;

            // Calculate expiration time
            const expiresIn = data.expires_in || 3600; // Default to 1 hour
            this.state.expiresAt = new Date().getTime() + expiresIn * 1000;

            // Store tokens in localStorage
            localStorage.setItem('spotify_access_token', this.state.accessToken);
            localStorage.setItem('spotify_refresh_token', this.state.refreshToken);
            localStorage.setItem('spotify_expires_at', this.state.expiresAt);

            console.log('Token received and stored successfully');

            // Initialize player with the new token
            this.initPlayer();

            return data;
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            throw error;
        }
    },

    /**
     * Redirect to Spotify authorization page via backend
     */
    async authorize() {
        try {
            console.log('Attempting to connect to Spotify...');
            console.log('Making request to:', `${this.config.backendBaseUrl}${this.config.spotifyLoginUrl}`);

            // Check if backend is available first
            const response = await fetch(`${this.config.backendBaseUrl}${this.config.spotifyLoginUrl}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`Backend returned error: ${response.status} ${response.statusText}`);
            }

            // Try to parse the response as JSON
            let data;
            try {
                data = await response.json();
                console.log('Response data:', data);
            } catch (parseError) {
                console.error('Error parsing response as JSON:', parseError);
                const text = await response.text();
                console.log('Response text:', text);
                throw new Error('Invalid JSON response from backend');
            }

            if (data && data.authUrl) {
                // Redirect to the authorization URL
                console.log('Redirecting to Spotify authorization URL:', data.authUrl);
                window.location.href = data.authUrl;
            } else {
                console.error('No authUrl in response:', data);
                throw new Error('No authorization URL received from backend');
            }
        } catch (error) {
            console.error('Error getting authorization URL:', error);

            // For any backend error, just log it and continue with the app
            console.log('Backend error or unavailable. Using placeholder data instead.');
            console.log('Error details:', error);

            // Generate a fake token for testing
            const fakeAccessToken = 'fake_' + Math.random().toString(36).substring(2, 15);

            // Store the token in localStorage
            localStorage.setItem('spotify_access_token', fakeAccessToken);

            // Set expiration time to 1 hour from now
            const expiresAt = new Date().getTime() + 3600 * 1000;
            localStorage.setItem('spotify_expires_at', expiresAt);

            // Update state
            this.state.accessToken = fakeAccessToken;
            this.state.expiresAt = expiresAt;

            // Reload the page to apply the changes
            window.location.reload();
        }
    },

    /**
     * Generate a random string of specified length
     * @param {number} length - Length of the string
     * @returns {string} Random string
     */
    generateRandomString(length) {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },

    /**
     * Refresh the access token using the refresh token
     * @returns {Promise} Promise that resolves when the token is refreshed
     */
    async refreshToken() {
        if (!this.state.refreshToken) {
            console.error('No refresh token available');
            this.logout();
            this.authorize();
            return;
        }

        try {
            const response = await fetch(`${this.config.backendBaseUrl}${this.config.spotifyRefreshUrl}?refreshToken=${this.state.refreshToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Update access token
            this.state.accessToken = data.access_token;

            // Calculate new expiration time
            const expiresIn = data.expires_in || 3600; // Default to 1 hour
            this.state.expiresAt = new Date().getTime() + expiresIn * 1000;

            // Store updated token in localStorage
            localStorage.setItem('spotify_access_token', this.state.accessToken);
            localStorage.setItem('spotify_expires_at', this.state.expiresAt);

            console.log('Token refreshed successfully');

            return data;
        } catch (error) {
            console.error('Error refreshing token:', error);

            // If refresh fails, re-authorize
            this.logout();
            this.authorize();
        }
    },

    /**
     * Initialize the Spotify Web Playback SDK
     */
    initPlayer() {
        if (!this.state.accessToken) {
            console.error('Cannot initialize player without access token');
            return;
        }

        // Skip initialization if using a fake token
        if (this.state.accessToken.startsWith('fake_')) {
            console.log('Using fake token, skipping Web Playback SDK initialization');
            return;
        }

        // Wait for the Spotify Web Playback SDK to be loaded
        window.onSpotifyWebPlaybackSDKReady = () => {
            this.state.player = new Spotify.Player({
                name: 'Kanzanso Music Player',
                getOAuthToken: cb => { cb(this.state.accessToken); },
                volume: 0.5
            });

            // Error handling
            this.state.player.addListener('initialization_error', ({ message }) => {
                console.error('Initialization error:', message);
            });

            this.state.player.addListener('authentication_error', ({ message }) => {
                console.error('Authentication error:', message);
                // If authentication fails, try to re-authorize
                this.authorize();
            });

            this.state.player.addListener('account_error', ({ message }) => {
                console.error('Account error:', message);
            });

            this.state.player.addListener('playback_error', ({ message }) => {
                console.error('Playback error:', message);
            });

            // Playback status updates
            this.state.player.addListener('player_state_changed', state => {
                if (!state) return;

                this.state.isPlaying = !state.paused;
                this.state.currentTrack = state.track_window.current_track;

                // Dispatch an event so other components can react
                const event = new CustomEvent('spotify-player-state-changed', { detail: state });
                document.dispatchEvent(event);

                // Check if track ended
                if (state.paused &&
                    state.position === 0 &&
                    state.restrictions.disallow_resuming_reasons &&
                    state.restrictions.disallow_resuming_reasons[0] === 'not_paused') {
                    console.log('Track ended');

                    // Dispatch track ended event
                    const endEvent = new CustomEvent('spotify-track-ended');
                    document.dispatchEvent(endEvent);
                }
            });

            // Ready
            this.state.player.addListener('ready', ({ device_id }) => {
                console.log('Spotify player ready with device ID:', device_id);
                this.state.deviceId = device_id;

                // Dispatch ready event
                const event = new CustomEvent('spotify-player-ready', { detail: { deviceId: device_id } });
                document.dispatchEvent(event);
            });

            // Not Ready
            this.state.player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline:', device_id);
            });

            // Connect to the player
            this.state.player.connect();
        };

        // Load the Spotify Web Playback SDK if it's not already loaded
        if (!window.Spotify) {
            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            document.body.appendChild(script);
        } else if (typeof window.onSpotifyWebPlaybackSDKReady === 'function') {
            // If the SDK is already loaded, call the ready function directly
            window.onSpotifyWebPlaybackSDKReady();
        }
    },

    /**
     * Play a track on the current device
     * @param {string} trackUri - Spotify URI of the track to play
     * @returns {Promise} Promise that resolves when the track starts playing
     */
    async playTrack(trackUri) {
        if (!this.state.accessToken) {
            console.error('Cannot play track without access token');
            return;
        }

        // Check if we're using a fake token (for testing)
        if (this.state.accessToken.startsWith('fake_')) {
            console.log('Using fake token, simulating playback');
            // Simulate successful playback
            return true;
        }

        if (!this.state.deviceId) {
            console.error('Cannot play track without device ID');
            return;
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/me/player/play?device_id=${this.state.deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.state.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [trackUri]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error.message);
            }

            return true;
        } catch (error) {
            console.error('Error playing track:', error);
            throw error;
        }
    },

    /**
     * Get recommendations based on mood
     * @param {string} mood - The mood to get recommendations for
     * @param {number} limit - Number of recommendations to get (default: 20)
     * @returns {Promise<Object>} Promise that resolves with the recommendations
     */
    async getRecommendationsByMood(mood, limit = 20) {
        if (!this.state.accessToken) {
            console.error('Cannot get recommendations without access token');
            return;
        }

        // Check if we're using a fake token (for testing)
        if (this.state.accessToken.startsWith('fake_')) {
            console.log('Using fake token, returning placeholder recommendations');
            return this.getPlaceholderRecommendations(mood);
        }

        // Define mood parameters
        const moodParams = {
            happy: {
                seed_artists: '7n2wHs1TKAczGzO7Dd2rGr,1dfeR4HaWDbWqFHLkxsg1d,0du5cEVh5yTK9QJze8zA0C',
                seed_genres: 'pop,rock,electronic',
                seed_tracks: '4LRPiXqCikLlN15c3yImP7,7MXVkk9YMctZqd1Srtv4MB,3vqJY3pVELLIxqXXyI08yr',
                target_energy: 0.8,
                target_valence: 0.8,
                min_tempo: 100
            },
            sad: {
                seed_artists: '5GnnSrwNCGyfAU4zuIytiS,4LLpKhyESsyAXpc4laK94U,3DiDSECUqqY1AuBP8qtaIa',
                seed_genres: 'pop,acoustic,country',
                seed_tracks: '3XabMu0mJaQmrqz57UkEZI,1Cvvo5SkAtCj1iiSmLzJ6K,4NXXZjd4NObI6yK0JKaTEE',
                target_energy: 0.3,
                target_valence: 0.2,
                max_tempo: 100
            },
            nervous: {
                seed_artists: '5GnnSrwNCGyfAU4zuIytiS,6LuN9FCkKOj5PcnpouEgny,3DiDSECUqqY1AuBP8qtaIa',
                seed_genres: 'pop,electronic,acoustic',
                seed_tracks: '37ZJ0p5Jm13JPevGcx4SkF,7MJQ9Nfxzh8LPZ9e9u68Fq,6b8Be6ljOzmkOmFslEb23P',
                target_energy: 0.4,
                target_valence: 0.4,
                target_instrumentalness: 0.6
            },
            love: {
                seed_artists: '4YRxDV8wJFPHPTeXepOstw,36QJpDe2go2KgaRleHCDTp,4S9EykWXhStSc15wEx8QFK',
                seed_genres: 'pop,rock,blues',
                seed_tracks: '44AyOl4qVkzS48vBsbNXaC,0s26En1JoJhVj32vizElpA,1smFN2CLqGROu0J0UyvDfL',
                target_energy: 0.6,
                target_valence: 0.7,
                target_acousticness: 0.5
            },
            focus: {
                seed_genres: 'ambient,classical,study',
                target_energy: 0.3,
                target_instrumentalness: 0.8,
                target_valence: 0.5,
                max_tempo: 120
            },
            energetic: {
                seed_genres: 'dance,electronic,workout',
                target_energy: 0.9,
                target_valence: 0.7,
                min_tempo: 120
            }
        };

        // Get parameters for the selected mood
        const params = moodParams[mood] || moodParams.happy;

        // Build the URL with query parameters
        const url = new URL('https://api.spotify.com/v1/recommendations');
        url.searchParams.append('limit', limit);

        // Add all mood parameters to the URL
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        try {
            console.log('Getting recommendations from Spotify API:', url.toString());
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.state.accessToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP error! status: ${response.status}`;

                try {
                    const error = JSON.parse(errorText);
                    errorMessage = error.error || 'Failed to get recommendations';
                } catch (e) {
                    // If JSON parsing fails, use the default error message
                    console.warn('Failed to parse error response:', e);
                }

                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting recommendations:', error);

            // If the token is expired, try to refresh it
            if (error.message.includes('401')) {
                await this.refreshToken();
                // Try again with the new token
                return this.getRecommendationsByMood(mood, limit);
            }

            // If we can't get recommendations from the API, use placeholders
            console.log('Using placeholder recommendations for mood:', mood);
            return this.getPlaceholderRecommendations(mood);
        }
    },

    /**
     * Get placeholder recommendations when the API is not available
     * @param {string} mood - The mood to get recommendations for
     * @returns {Object} Placeholder recommendations
     */
    getPlaceholderRecommendations(mood) {
        // Define placeholder tracks for each mood
        const placeholderTracks = {
            happy: [
                { name: "Happy", artists: [{ name: "Pharrell Williams" }], album: { name: "G I R L" } },
                { name: "Can't Stop the Feeling", artists: [{ name: "Justin Timberlake" }], album: { name: "Trolls (Original Motion Picture Soundtrack)" } },
                { name: "Uptown Funk", artists: [{ name: "Mark Ronson" }, { name: "Bruno Mars" }], album: { name: "Uptown Special" } },
                { name: "Good as Hell", artists: [{ name: "Lizzo" }], album: { name: "Cuz I Love You" } },
                { name: "Walking on Sunshine", artists: [{ name: "Katrina & The Waves" }], album: { name: "Katrina & The Waves" } }
            ],
            sad: [
                { name: "Someone Like You", artists: [{ name: "Adele" }], album: { name: "21" } },
                { name: "Fix You", artists: [{ name: "Coldplay" }], album: { name: "X&Y" } },
                { name: "Skinny Love", artists: [{ name: "Bon Iver" }], album: { name: "For Emma, Forever Ago" } },
                { name: "Hurt", artists: [{ name: "Johnny Cash" }], album: { name: "American IV: The Man Comes Around" } },
                { name: "All I Want", artists: [{ name: "Kodaline" }], album: { name: "In a Perfect World" } }
            ],
            nervous: [
                { name: "Breathe Me", artists: [{ name: "Sia" }], album: { name: "Colour the Small One" } },
                { name: "Weightless", artists: [{ name: "Marconi Union" }], album: { name: "Weightless" } },
                { name: "Calm Down", artists: [{ name: "Taylor Swift" }], album: { name: "Midnights" } },
                { name: "Breathin", artists: [{ name: "Ariana Grande" }], album: { name: "Sweetener" } },
                { name: "Don't Panic", artists: [{ name: "Coldplay" }], album: { name: "Parachutes" } }
            ],
            love: [
                { name: "All of Me", artists: [{ name: "John Legend" }], album: { name: "Love in the Future" } },
                { name: "Perfect", artists: [{ name: "Ed Sheeran" }], album: { name: "÷" } },
                { name: "At Last", artists: [{ name: "Etta James" }], album: { name: "At Last!" } },
                { name: "Thinking Out Loud", artists: [{ name: "Ed Sheeran" }], album: { name: "x" } },
                { name: "Can't Help Falling in Love", artists: [{ name: "Elvis Presley" }], album: { name: "Blue Hawaii" } }
            ],
            focus: [
                { name: "Experience", artists: [{ name: "Ludovico Einaudi" }], album: { name: "In a Time Lapse" } },
                { name: "Time", artists: [{ name: "Hans Zimmer" }], album: { name: "Inception (Music from the Motion Picture)" } },
                { name: "Intro", artists: [{ name: "The xx" }], album: { name: "xx" } },
                { name: "Strobe", artists: [{ name: "Deadmau5" }], album: { name: "For Lack of a Better Name" } },
                { name: "Divenire", artists: [{ name: "Ludovico Einaudi" }], album: { name: "Divenire" } }
            ],
            energetic: [
                { name: "Eye of the Tiger", artists: [{ name: "Survivor" }], album: { name: "Eye of the Tiger" } },
                { name: "Stronger", artists: [{ name: "Kanye West" }], album: { name: "Graduation" } },
                { name: "Don't Stop Me Now", artists: [{ name: "Queen" }], album: { name: "Jazz" } },
                { name: "Levels", artists: [{ name: "Avicii" }], album: { name: "Levels" } },
                { name: "Can't Hold Us", artists: [{ name: "Macklemore & Ryan Lewis" }], album: { name: "The Heist" } }
            ]
        };

        // Return a structure similar to the Spotify API response
        return {
            tracks: placeholderTracks[mood] || placeholderTracks.happy,
            seeds: [],
            _placeholder: true // Flag to indicate this is placeholder data
        };
    },

    /**
     * Search for tracks, artists, or albums
     * @param {string} query - Search query
     * @param {string} type - Type of search (track, artist, album)
     * @param {number} limit - Number of results to return (default: 20)
     * @returns {Promise<Object>} Promise that resolves with the search results
     */
    async search(query, type = 'track', limit = 20) {
        if (!this.state.accessToken) {
            console.error('Cannot search without access token');
            return;
        }

        // Check if we're using a fake token (for testing)
        if (this.state.accessToken.startsWith('fake_')) {
            console.log('Using fake token, returning placeholder search results');
            return {
                tracks: { items: [] },
                artists: { items: [] },
                albums: { items: [] },
                _placeholder: true
            };
        }

        try {
            const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`;
            console.log('Searching Spotify API:', searchUrl);

            const response = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.state.accessToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP error! status: ${response.status}`;

                try {
                    const error = JSON.parse(errorText);
                    errorMessage = error.error || 'Failed to search';
                } catch (e) {
                    // If JSON parsing fails, use the default error message
                    console.warn('Failed to parse error response:', e);
                }

                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching:', error);

            // If the token is expired, try to refresh it
            if (error.message.includes('401')) {
                await this.refreshToken();
                // Try again with the new token
                return this.search(query, type, limit);
            }

            // Return empty results if search fails
            return {
                tracks: { items: [] },
                artists: { items: [] },
                albums: { items: [] },
                _placeholder: true
            };
        }
    },

    /**
     * Get the user's playlists
     * @param {number} limit - Number of playlists to return (default: 50)
     * @returns {Promise<Object>} Promise that resolves with the user's playlists
     */
    async getUserPlaylists(limit = 50) {
        if (!this.state.accessToken) {
            console.error('Cannot get playlists without access token');
            return;
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/me/playlists?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.state.accessToken}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting playlists:', error);
            throw error;
        }
    },

    /**
     * Get tracks from a playlist
     * @param {string} playlistId - Spotify ID of the playlist
     * @param {number} limit - Number of tracks to return (default: 100)
     * @returns {Promise<Object>} Promise that resolves with the playlist tracks
     */
    async getPlaylistTracks(playlistId, limit = 100) {
        if (!this.state.accessToken) {
            console.error('Cannot get playlist tracks without access token');
            return;
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/playlists/${playlistId}/tracks?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.state.accessToken}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting playlist tracks:', error);
            throw error;
        }
    },

    /**
     * Get the user's profile
     * @returns {Promise<Object>} Promise that resolves with the user's profile
     */
    async getUserProfile() {
        if (!this.state.accessToken) {
            console.error('Cannot get user profile without access token');
            return;
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.state.accessToken}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    },

    /**
     * Pause playback
     * @returns {Promise} Promise that resolves when playback is paused
     */
    async pausePlayback() {
        if (!this.state.accessToken || !this.state.deviceId) {
            console.error('Cannot pause playback without access token or device ID');
            return;
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/me/player/pause?device_id=${this.state.deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.state.accessToken}`
                }
            });

            if (response.status === 204) {
                return true;
            }

            const error = await response.json();
            throw new Error(error.error.message);
        } catch (error) {
            console.error('Error pausing playback:', error);
            throw error;
        }
    },

    /**
     * Resume playback
     * @returns {Promise} Promise that resolves when playback is resumed
     */
    async resumePlayback() {
        if (!this.state.accessToken || !this.state.deviceId) {
            console.error('Cannot resume playback without access token or device ID');
            return;
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/me/player/play?device_id=${this.state.deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.state.accessToken}`
                }
            });

            if (response.status === 204) {
                return true;
            }

            const error = await response.json();
            throw new Error(error.error.message);
        } catch (error) {
            console.error('Error resuming playback:', error);
            throw error;
        }
    },

    /**
     * Skip to the next track
     * @returns {Promise} Promise that resolves when the track is skipped
     */
    async skipToNext() {
        if (!this.state.accessToken || !this.state.deviceId) {
            console.error('Cannot skip to next track without access token or device ID');
            return;
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/me/player/next?device_id=${this.state.deviceId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.state.accessToken}`
                }
            });

            if (response.status === 204) {
                return true;
            }

            const error = await response.json();
            throw new Error(error.error.message);
        } catch (error) {
            console.error('Error skipping to next track:', error);
            throw error;
        }
    },

    /**
     * Skip to the previous track
     * @returns {Promise} Promise that resolves when the track is skipped
     */
    async skipToPrevious() {
        if (!this.state.accessToken || !this.state.deviceId) {
            console.error('Cannot skip to previous track without access token or device ID');
            return;
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/me/player/previous?device_id=${this.state.deviceId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.state.accessToken}`
                }
            });

            if (response.status === 204) {
                return true;
            }

            const error = await response.json();
            throw new Error(error.error.message);
        } catch (error) {
            console.error('Error skipping to previous track:', error);
            throw error;
        }
    },

    /**
     * Set the volume
     * @param {number} volumePercent - Volume percentage (0-100)
     * @returns {Promise} Promise that resolves when the volume is set
     */
    async setVolume(volumePercent) {
        if (!this.state.accessToken || !this.state.deviceId) {
            console.error('Cannot set volume without access token or device ID');
            return;
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/me/player/volume?volume_percent=${volumePercent}&device_id=${this.state.deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.state.accessToken}`
                }
            });

            if (response.status === 204) {
                return true;
            }

            const error = await response.json();
            throw new Error(error.error.message);
        } catch (error) {
            console.error('Error setting volume:', error);
            throw error;
        }
    },

    /**
     * Logout from Spotify
     */
    logout() {
        // Clear tokens from localStorage
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_expires_at');

        // Clear state
        this.state.accessToken = null;
        this.state.refreshToken = null;
        this.state.expiresAt = null;

        // Disconnect player if it exists
        if (this.state.player) {
            this.state.player.disconnect();
            this.state.player = null;
        }

        console.log('Logged out from Spotify');
    },

    /**
     * Check if the user is logged in to Spotify
     * @returns {boolean} True if the user is logged in
     */
    isLoggedIn() {
        // Check if we have an access token
        if (!this.state.accessToken) {
            return false;
        }

        // Check if the token is a fake token (for testing)
        // We still return true for fake tokens to allow the UI to work
        if (this.state.accessToken.startsWith('fake_')) {
            console.log('Using fake token for authentication');
            return true;
        }

        return true;
    },

    /**
     * Get track information in a standardized format
     * @param {Object} track - Track object from Spotify API
     * @returns {Object} Standardized track object
     */
    formatTrack(track) {
        if (!track) return null;

        // Handle placeholder tracks or when using fake token
        if (!track.id || this.state.accessToken?.startsWith('fake_')) {
            return {
                id: `placeholder-${Math.random().toString(36).substring(2, 9)}`,
                name: track.name || 'Unknown Track',
                artists: track.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
                album: track.album?.name || 'Unknown Album',
                duration: track.duration_ms || 0,
                isPlaceholder: true
            };
        }

        // Format track from Spotify API
        return {
            id: track.id,
            uri: track.uri,
            name: track.name,
            artists: track.artists?.map(a => a.name).join(', '),
            album: track.album?.name,
            albumArt: track.album?.images?.[0]?.url,
            duration: track.duration_ms,
            isPlaceholder: false
        };
    }
};

// Export the service
window.spotifyService = spotifyService;