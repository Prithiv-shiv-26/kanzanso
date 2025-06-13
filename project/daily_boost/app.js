/**
 * Daily Boost App
 * Main application logic for the Daily Boost feature
 */

// DOM Elements
const challengesContainer = document.getElementById('challenges-container');
const insightsCarousel = document.getElementById('insights-carousel');
const dailyProgressCircle = document.getElementById('daily-progress');
const dailyProgressText = document.querySelector('#daily-progress + .percentage');
const streakCountElement = document.getElementById('streak-count');
const challengesCountElement = document.getElementById('challenges-count');
const insightsCountElement = document.getElementById('insights-count');
const toastContainer = document.getElementById('toast-container');

// Filter elements
const statusFilter = document.getElementById('status-filter');
const categoryFilter = document.getElementById('category-filter');
const difficultyFilter = document.getElementById('difficulty-filter');
const clearFiltersButton = document.getElementById('clear-filters');

// Templates will be initialized in the init function

// Challenge template elements
let challengeTemplates = {};
let insightTemplate;

// State
let challenges = [];
let filteredChallenges = [];
let insights = [];
let stats = {
    streak: 0,
    completionPercentage: 0,
    insightsCount: 0,
    totalChallengesCompleted: 0,
    completedToday: []
};

/**
 * Initialize the application
 */
async function init() {
    console.log('Initializing Daily Boost app...');

    // Initialize templates
    const templatesContainer = document.querySelector('.templates');
    if (!templatesContainer) {
        console.error('Templates container not found!');
        return;
    }

    // Initialize challenge templates
    challengeTemplates = {
        journal: templatesContainer.querySelector('[data-template="journal"]'),
        mood: templatesContainer.querySelector('[data-template="mood"]'),
        todo: templatesContainer.querySelector('[data-template="todo"]'),
        assessment: templatesContainer.querySelector('[data-template="assessment"]'),
        playlist: templatesContainer.querySelector('[data-template="playlist"]'),
        mindfulness: templatesContainer.querySelector('[data-template="mindfulness"]'),
        growth: templatesContainer.querySelector('[data-template="growth"]')
    };

    // Initialize insight template
    insightTemplate = templatesContainer.querySelector('[data-template="insight"]');

    // Check if templates were found
    if (!challengeTemplates.journal || !insightTemplate) {
        console.error('Templates not found!', { challengeTemplates, insightTemplate });
    }

    // Check if user is logged in
    if (!window.api?.isAuthenticated?.()) {
        console.log('User not authenticated, redirecting to login page');
        window.location.href = '../login/index.html?redirect=' + encodeURIComponent(window.location.href);
        return;
    }

    // Log the token for debugging
    console.log('User is authenticated with token:', localStorage.getItem('token') ? 'Token exists' : 'No token found');
    console.log('User ID:', localStorage.getItem('userId'));

    // Show loading state
    showLoading();

    try {
        console.log('Loading data from backend...');

        // Load data in parallel
        const [challengesData, insightsData, statsData] = await Promise.all([
            dailyBoostService.getChallenges(),
            dailyBoostService.getInsights(),
            dailyBoostService.getStats()
        ]);

        console.log('Data loaded successfully', {
            challenges: challengesData?.length || 0,
            insights: insightsData?.length || 0,
            stats: statsData
        });

        // Update state
        challenges = challengesData;
        filteredChallenges = [...challenges]; // Initialize filtered challenges with all challenges
        insights = insightsData;
        stats = statsData;

        // Initialize filters
        initializeFilters();

        // Render UI
        renderChallenges();
        renderInsights();
        updateStats();

        // Hide loading state
        hideLoading();
    } catch (error) {
        console.error('Error initializing Daily Boost:', error);
        showError('Failed to load Daily Boost data. Please try again later.');
    }
}

/**
 * Show loading state
 */
function showLoading() {
    challengesContainer.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading your personalized challenges...</p>
        </div>
    `;

    insightsCarousel.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading insights...</p>
        </div>
    `;
}

/**
 * Hide loading state
 */
function hideLoading() {
    // Loading is hidden when content is rendered
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    console.error('Error:', message);

    const container = challengesContainer || document.querySelector('main');

    if (container) {
        container.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 2rem; color: #f44336;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.2rem;">${message}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
    } else {
        // If no container is available, show an alert
        alert(`Error: ${message}`);
    }
}

/**
 * Initialize filter event listeners
 */
function initializeFilters() {
    if (!statusFilter || !categoryFilter || !difficultyFilter || !clearFiltersButton) {
        console.error('Filter elements not found!');
        return;
    }

    // Add event listeners to filters
    statusFilter.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    difficultyFilter.addEventListener('change', applyFilters);

    // Add event listener to clear filters button
    clearFiltersButton.addEventListener('click', clearFilters);
}

/**
 * Apply filters to challenges
 */
function applyFilters() {
    const status = statusFilter.value;
    const category = categoryFilter.value;
    const difficulty = difficultyFilter.value;

    console.log('Applying filters:', { status, category, difficulty });

    // Filter challenges based on selected criteria
    filteredChallenges = challenges.filter(challenge => {
        // Filter by status
        if (status !== 'all') {
            if (status === 'completed' && !challenge.completed) return false;
            if (status === 'active' && challenge.completed) return false;
        }

        // Filter by category
        if (category !== 'all') {
            const lowerCategory = challenge.category?.toLowerCase() || '';
            if (!lowerCategory.includes(category.toLowerCase())) return false;
        }

        // Filter by difficulty
        if (difficulty !== 'all') {
            if (challenge.difficulty !== parseInt(difficulty)) return false;
        }

        return true;
    });

    // Render filtered challenges
    renderChallenges();

    // Show toast with filter results
    showToast('Filters Applied', `Showing ${filteredChallenges.length} of ${challenges.length} challenges`, 'info');
}

/**
 * Clear all filters
 */
function clearFilters() {
    // Reset filter selects
    statusFilter.value = 'all';
    categoryFilter.value = 'all';
    difficultyFilter.value = 'all';

    // Reset filtered challenges
    filteredChallenges = [...challenges];

    // Render all challenges
    renderChallenges();

    // Show toast
    showToast('Filters Cleared', 'Showing all challenges', 'info');
}

/**
 * Render challenges
 */
function renderChallenges() {
    // Clear container
    challengesContainer.innerHTML = '';

    // Use filtered challenges instead of all challenges
    if (!filteredChallenges || filteredChallenges.length === 0) {
        challengesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>No challenges match your filters. Try clearing filters or check back later!</p>
            </div>
        `;
        return;
    }

    // Render each challenge
    filteredChallenges.forEach(challenge => {
        console.log('Rendering challenge:', challenge);

        const template = getChallengeTemplate(challenge.category);
        if (!template) {
            console.error('No template found for challenge:', challenge);
            return;
        }

        const challengeCard = template.cloneNode(true);
        challengeCard.removeAttribute('data-template');
        challengeCard.setAttribute('data-id', challenge.id);

        // Update challenge content
        challengeCard.querySelector('.challenge-category').textContent = challenge.category;
        challengeCard.querySelector('.challenge-title').textContent = challenge.title;
        challengeCard.querySelector('.challenge-description').textContent = challenge.description;

        // Update difficulty stars
        const difficultyContainer = challengeCard.querySelector('.challenge-difficulty');
        difficultyContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('i');
            star.classList.add('fas');

            // Add the appropriate star class based on difficulty
            if (i < challenge.difficulty) {
                star.classList.add('fa-star');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
                star.classList.add('fa-star');
            }

            difficultyContainer.appendChild(star);
        }

        // Update progress
        const progressFill = challengeCard.querySelector('.progress-fill');
        const progressText = challengeCard.querySelector('.progress-text');
        progressFill.style.width = `${challenge.progress}%`;
        progressText.textContent = `${challenge.progress}%`;

        // Update action buttons
        const startBtn = challengeCard.querySelector('.start-btn');
        startBtn.href = challenge.link;

        // Add event listeners
        const addTodoBtn = challengeCard.querySelector('.add-todo-btn');
        addTodoBtn.addEventListener('click', () => addChallengeToTodo(challenge));

        const completeBtn = challengeCard.querySelector('.complete-btn');
        completeBtn.addEventListener('click', () => completeChallenge(challenge.id));

        // If challenge is completed, update UI
        if (challenge.completed) {
            challengeCard.classList.add('completed');
            progressFill.style.width = '100%';
            progressText.textContent = '100%';
            completeBtn.disabled = true;
            completeBtn.textContent = 'Completed';
        }

        // Add to container
        challengesContainer.appendChild(challengeCard);
    });
}

/**
 * Get the appropriate template for a challenge category
 * @param {string} category - Challenge category
 * @returns {HTMLElement} - Template element
 */
function getChallengeTemplate(category) {
    if (!category) {
        console.warn('No category provided for challenge template');
        return challengeTemplates.journal || Object.values(challengeTemplates)[0];
    }

    const lowerCategory = category.toLowerCase();

    // Map category to template
    if (lowerCategory.includes('journal')) {
        return challengeTemplates.journal;
    }
    if (lowerCategory.includes('mood')) {
        return challengeTemplates.mood;
    }
    if (lowerCategory.includes('to-do') || lowerCategory.includes('todo')) {
        return challengeTemplates.todo;
    }
    if (lowerCategory.includes('assessment') || lowerCategory.includes('quiz')) {
        return challengeTemplates.assessment;
    }
    if (lowerCategory.includes('playlist') || lowerCategory.includes('music')) {
        return challengeTemplates.playlist;
    }
    if (lowerCategory.includes('mindfulness') || lowerCategory.includes('meditation')) {
        return challengeTemplates.mindfulness;
    }
    if (lowerCategory.includes('growth') || lowerCategory.includes('wellbeing')) {
        return challengeTemplates.growth;
    }

    // Default to any available template
    console.warn(`No template found for category: ${category}, using default`);
    return challengeTemplates.journal || Object.values(challengeTemplates)[0];
}

/**
 * Render insights
 */
function renderInsights() {
    // Clear container
    insightsCarousel.innerHTML = '';

    if (!insights || insights.length === 0) {
        insightsCarousel.innerHTML = `
            <div class="empty-insights">
                <i class="fas fa-lightbulb"></i>
                <p>Complete challenges to unlock personal insights!</p>
            </div>
        `;
        return;
    }

    // Render each insight
    insights.forEach(insight => {
        console.log('Rendering insight:', insight);

        if (!insightTemplate) {
            console.error('Insight template not found!');
            return;
        }

        const insightCard = insightTemplate.cloneNode(true);
        insightCard.removeAttribute('data-template');

        // Update insight content
        insightCard.querySelector('.insight-title').textContent = insight.title;
        insightCard.querySelector('.insight-source').textContent = insight.source;
        insightCard.querySelector('.insight-content').textContent = insight.content;

        // Format date
        const date = new Date(insight.createdAt);
        insightCard.querySelector('.insight-date').textContent = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Add to container
        insightsCarousel.appendChild(insightCard);
    });
}

/**
 * Update stats display
 */
function updateStats() {
    if (!stats) {
        console.warn('No stats available to update display');
        return;
    }

    // Update streak count
    if (streakCountElement) {
        streakCountElement.textContent = stats.streak || 0;
    }

    // Update challenges count
    if (challengesCountElement) {
        // Make sure we're using the correct property from the stats object
        challengesCountElement.textContent = stats.totalChallengesCompleted || 0;

        // Log the value to help with debugging
        console.log('Updated challenges count:', stats.totalChallengesCompleted);
    }

    // Update insights count
    if (insightsCountElement) {
        insightsCountElement.textContent = stats.insightsCount || 0;
    }

    // Update progress circle
    updateProgressCircle(stats.completionPercentage || 0);
}

/**
 * Update progress circle
 * @param {number} percentage - Progress percentage
 */
function updateProgressCircle(percentage) {
    // Update circle
    dailyProgressCircle.setAttribute('stroke-dasharray', `${percentage}, 100`);
    dailyProgressText.textContent = `${percentage}%`;
}

/**
 * Add a challenge to the todo list
 * @param {Object} challenge - Challenge to add
 */
async function addChallengeToTodo(challenge) {
    try {
        await dailyBoostService.addToTodo(challenge);
        showToast('Success', 'Challenge added to your todo list', 'success');
    } catch (error) {
        console.error('Error adding challenge to todo list:', error);
        showToast('Error', 'Failed to add challenge to todo list', 'error');
    }
}

/**
 * Complete a challenge
 * @param {string} challengeId - ID of the challenge to complete
 */
async function completeChallenge(challengeId) {
    try {
        // Update UI immediately for better UX
        const challengeCard = document.querySelector(`.challenge-card[data-id="${challengeId}"]`);
        if (challengeCard) {
            const progressFill = challengeCard.querySelector('.progress-fill');
            const progressText = challengeCard.querySelector('.progress-text');
            const completeBtn = challengeCard.querySelector('.complete-btn');

            progressFill.style.width = '100%';
            progressText.textContent = '100%';
            completeBtn.disabled = true;
            challengeCard.classList.add('completed');
        }

        // Call API to complete challenge
        await dailyBoostService.completeChallenge(challengeId);

        // Get updated stats
        stats = await dailyBoostService.getStats();
        updateStats();

        // Show success message
        showToast('Challenge Completed', 'Great job! Keep up the good work.', 'success');

        // Check if we need to refresh insights (if a new one was unlocked)
        if (stats.insightsCount > insights.length) {
            insights = await dailyBoostService.getInsights();
            renderInsights();
        }
    } catch (error) {
        console.error('Error completing challenge:', error);
        showToast('Error', 'Failed to complete challenge', 'error');

        // Revert UI changes
        renderChallenges();
    }
}

/**
 * Update challenge progress
 * @param {string} challengeId - ID of the challenge to update
 * @param {number} progress - Progress percentage
 */
async function updateChallengeProgress(challengeId, progress) {
    try {
        // Update UI immediately for better UX
        const challengeCard = document.querySelector(`.challenge-card[data-id="${challengeId}"]`);
        if (challengeCard) {
            const progressFill = challengeCard.querySelector('.progress-fill');
            const progressText = challengeCard.querySelector('.progress-text');

            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
        }

        // Call API to update progress
        await dailyBoostService.updateProgress(challengeId, progress);
    } catch (error) {
        console.error('Error updating challenge progress:', error);
        showToast('Error', 'Failed to update challenge progress', 'error');

        // Revert UI changes
        renderChallenges();
    }
}

/**
 * Show a toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, info)
 */
function showToast(title, message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.classList.add('toast', type);

    // Set toast content
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle')}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close">
            <i class="fas fa-times"></i>
        </div>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Add close button event listener
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    // Make sure the required services are available
    if (!window.api) {
        console.error('API service is not defined!');
        showError('API service is not available. Please refresh the page or check your connection.');
        return;
    }

    // Check if API is ready
    if (!window.api?.isReady?.()) {
        console.error('API service is not ready!');
        showError('API service is not ready. Please refresh the page or check your connection.');
        return;
    }

    if (!window.dailyBoostService) {
        console.error('dailyBoostService is not defined!');
        showError('Failed to initialize the application. Please refresh the page.');
        return;
    }

    // Initialize the app
    init();
});