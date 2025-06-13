// DOM Elements
const container = document.getElementById('container');
const text = document.getElementById('text');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const playText = document.getElementById('play-text');
const volumeSlider = document.getElementById('volume-slider');
const restartBtn = document.getElementById('restart-btn');
const speedSelector = document.getElementById('speed-selector');
const audio = document.getElementById('meditation-audio');

// Timing variables
let totalTime = 7500; // Default medium speed
const speedSettings = {
    slow: 10000,
    medium: 7500,
    fast: 5000
};

// Initialize
let breathAnimation;
let isPlaying = false;

// Start the breathing animation
function startBreathingAnimation() {
    // Calculate breath times based on total time
    const breatheTime = (totalTime / 5) * 2;
    const holdTime = totalTime / 5;

    // Clear any existing interval
    if (breathAnimation) {
        clearInterval(breathAnimation);
    }

    // Define the animation function
    function animate() {
        text.innerText = 'Breathe In';
        container.className = 'container grow';

        setTimeout(() => {
            text.innerText = 'Hold';

            setTimeout(() => {
                text.innerText = 'Breathe Out';
                container.className = 'container shrink';
            }, holdTime);
        }, breatheTime);
    }

    // Run animation immediately
    animate();

    // Set interval for continuous animation
    breathAnimation = setInterval(animate, totalTime);
}

// Initialize the page
function init() {
    // Start breathing animation
    startBreathingAnimation();

    // Set initial volume
    audio.volume = volumeSlider.value;

    // Set up event listeners
    playPauseBtn.addEventListener('click', toggleAudio);
    volumeSlider.addEventListener('input', adjustVolume);
    restartBtn.addEventListener('click', restartMeditation);
    speedSelector.addEventListener('change', changeSpeed);
}

// Toggle audio play/pause
function toggleAudio() {
    if (isPlaying) {
        audio.pause();
        playIcon.className = 'fas fa-play';
        playText.textContent = 'Play Music';
    } else {
        audio.play();
        playIcon.className = 'fas fa-pause';
        playText.textContent = 'Pause Music';
    }

    isPlaying = !isPlaying;
}

// Adjust audio volume
function adjustVolume() {
    audio.volume = volumeSlider.value;
}

// Restart meditation
function restartMeditation() {
    // Reset and restart breathing animation
    if (breathAnimation) {
        clearInterval(breathAnimation);
    }

    startBreathingAnimation();

    // Show feedback
    text.innerText = 'Breathe In';
    container.className = 'container grow';
}

// Change breathing speed
function changeSpeed() {
    const speed = speedSelector.value;
    totalTime = speedSettings[speed];

    // Restart animation with new speed
    restartMeditation();
}

// Initialize when the page loads
window.addEventListener('load', init);
