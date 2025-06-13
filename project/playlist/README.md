# Spotify Integration for Kanzanso

This folder contains the Mood-Based Music Player feature powered by Spotify.

## Setup Instructions

### 1. Create a Spotify Developer Account

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account or create a new one
3. Click "Create an App"
4. Fill in the app name (e.g., "Kanzanso Music Player") and description
5. Accept the terms and click "Create"

### 2. Configure Your Spotify App

1. In your app dashboard, click "Edit Settings"
2. Add your local development URL as a Redirect URI:
   - If using VS Code Live Server: `http://127.0.0.1:5500/project/playlist/index.html`
   - If using a different server, use your actual URL (check your browser address bar)
   - Make sure to include the full path, including protocol (http/https), domain, port, and path
3. Save the settings

### 3. Update Client ID

1. In the Spotify Developer Dashboard, find your Client ID
2. Open `../services/spotifyService.js`
3. Replace the `clientId` value with your Client ID:
   ```javascript
   clientId: 'YOUR_CLIENT_ID_HERE',
   ```

### 4. Run the Application

1. Start your local server
2. Navigate to the playlist page
3. Click "Connect to Spotify" to authorize the application
4. Select a mood to start playing music

### 5. Testing the Integration

We've included a test page to help you verify that the Spotify integration is working correctly:

1. Open `test-spotify.html` in your browser
2. Click "Connect to Spotify" to authorize the application
3. Use the various buttons to test different features:
   - Get your user profile
   - Get mood-based recommendations
   - Search for tracks
   - Control playback (play, pause, skip, volume)

This test page is a helpful tool for debugging if you encounter any issues with the integration.

## Features

- **Mood-Based Recommendations**: Get personalized music recommendations based on your mood
- **Player Controls**: Play, pause, skip tracks, and adjust volume
- **Spotify Integration**: Seamlessly connects with your Spotify account
- **Responsive Design**: Works on desktop and mobile devices

## Troubleshooting

### "Connection refused" Error

This usually happens due to one of these issues:

1. **CORS (Cross-Origin Resource Sharing) restrictions**:
   - Make sure you're running the app on a proper web server, not just opening the HTML file directly
   - Use VS Code Live Server, http-server, or any other web server

2. **Incorrect Redirect URI**:
   - The Redirect URI in your Spotify Developer Dashboard must exactly match the URL you're using
   - Check the URL in your browser and make sure it matches what you set in the dashboard
   - Include the full path, including `http://` or `https://`, port number, and path

3. **Token Issues**:
   - Spotify tokens expire after an hour
   - Use the Debug Tool (link in the footer) to get a new token

### Playback Not Working

1. **Premium Account Required**:
   - The Spotify Web Playback SDK requires a Spotify Premium account
   - Free accounts can still see recommendations but can't play directly in the browser

2. **Ad Blockers or Privacy Extensions**:
   - Some ad blockers or privacy extensions might block the Spotify scripts
   - Try disabling them temporarily or adding an exception for your local development URL

3. **Browser Compatibility**:
   - The Spotify Web Playback SDK works best in Chrome, Firefox, and Edge
   - It may not work in Safari or other browsers

### Using the Debug Tool

We've included a debug tool to help diagnose issues:

1. Click the "Debug Tool" link in the footer
2. Use the tool to:
   - Check your connection status
   - Test the API connection
   - View your browser information
   - Test network connectivity
   - Get information about CORS issues

## Credits

- Spotify Web API: [Documentation](https://developer.spotify.com/documentation/web-api/)
- Spotify Web Playback SDK: [Documentation](https://developer.spotify.com/documentation/web-playback-sdk/)