// Simplified main.js without Spotify authentication

// Function to display placeholder playlist
function showPlaceholderPlaylist(mood) {
  const playlistTitle = document.getElementById('playlist-title');
  const playlistSongs = document.getElementById('playlist-songs');
  
  // Update title
  playlistTitle.textContent = `${mood.charAt(0).toUpperCase() + mood.slice(1)} Mood Playlist`;
  
  // Clear previous songs
  playlistSongs.innerHTML = '';
  
  // Add songs to the playlist
  const songs = placeholderPlaylists[mood];
  songs.forEach((song, index) => {
    const songElement = document.createElement('div');
    songElement.className = 'playlist-song';
    songElement.innerHTML = `
      <div class="song-number">${index + 1}</div>
      <div class="song-info">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
      </div>
      <div class="song-actions">
        <button class="play-button"><i class="fas fa-play"></i></button>
      </div>
    `;
    playlistSongs.appendChild(songElement);
  });
  
  // Add event listeners to play buttons
  const playButtons = document.querySelectorAll('.play-button');
  playButtons.forEach(button => {
    button.addEventListener('click', function() {
      alert('This is a placeholder. In a real app, this would play the song.');
    });
  });
}

// Placeholder data for different moods
const placeholderPlaylists = {
  happy: [
    { title: "Happy", artist: "Pharrell Williams" },
    { title: "Can't Stop the Feeling", artist: "Justin Timberlake" },
    { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
    { title: "Good as Hell", artist: "Lizzo" },
    { title: "Walking on Sunshine", artist: "Katrina & The Waves" }
  ],
  sad: [
    { title: "Someone Like You", artist: "Adele" },
    { title: "Fix You", artist: "Coldplay" },
    { title: "Skinny Love", artist: "Bon Iver" },
    { title: "Hurt", artist: "Johnny Cash" },
    { title: "All I Want", artist: "Kodaline" }
  ],
  nervous: [
    { title: "Breathe Me", artist: "Sia" },
    { title: "Weightless", artist: "Marconi Union" },
    { title: "Calm Down", artist: "Taylor Swift" },
    { title: "Breathin", artist: "Ariana Grande" },
    { title: "Don't Panic", artist: "Coldplay" }
  ],
  love: [
    { title: "All of Me", artist: "John Legend" },
    { title: "Perfect", artist: "Ed Sheeran" },
    { title: "At Last", artist: "Etta James" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran" },
    { title: "Can't Help Falling in Love", artist: "Elvis Presley" }
  ],
  focus: [
    { title: "Experience", artist: "Ludovico Einaudi" },
    { title: "Time", artist: "Hans Zimmer" },
    { title: "Intro", artist: "The xx" },
    { title: "Strobe", artist: "Deadmau5" },
    { title: "Divenire", artist: "Ludovico Einaudi" }
  ],
  energetic: [
    { title: "Eye of the Tiger", artist: "Survivor" },
    { title: "Stronger", artist: "Kanye West" },
    { title: "Don't Stop Me Now", artist: "Queen" },
    { title: "Levels", artist: "Avicii" },
    { title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis" }
  ]
};
