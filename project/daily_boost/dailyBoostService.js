/**
 * Daily Boost Service
 * Handles API calls to the backend for the Daily Boost feature
 */
class DailyBoostService {
    constructor() {
        // Check if API is available
        if (!window.api) {
            console.error('API service not available!');
            throw new Error('API service not available!');
        }

        console.log('DailyBoostService initialized');

        // Check if token is available
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No authentication token found!');
        } else {
            console.log('Authentication token found');
        }
    }
    /**
     * Get daily challenges for the current user
     * @returns {Promise<Array>} Array of challenge objects
     */
    async getChallenges() {
        try {
            console.log('Fetching challenges from API...');

            // Check if token is available
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No authentication token found when fetching challenges!');
                return this.getMockChallenges();
            }

            // Log the request details
            console.log('Making request to /daily-boost/challenges with token:', token.substring(0, 10) + '...');

            try {
                // Make the request
                const response = await window.api.get('/daily-boost/challenges');

                console.log('Challenges fetched successfully:', response.data);
                return response.data;
            } catch (apiError) {
                console.error('API error, using mock data:', apiError);
                return this.getMockChallenges();
            }
        } catch (error) {
            console.error('Error fetching challenges:', error);
            console.error('Error details:', error.response?.data || error.message);

            // If API fails, return mock data
            return this.getMockChallenges();
        }
    }

    /**
     * Get mock challenges for testing
     * @returns {Array} Array of mock challenge objects
     */
    getMockChallenges() {
        console.log('Using mock challenges data');

        return [
            {
                id: 'challenge-1',
                title: 'Reconnect with Journaling',
                description: 'It\'s been a while! Write a journal entry about what\'s been on your mind lately.',
                category: 'Journal',
                difficulty: 2,
                link: '../know_yourself/index.html#journal',
                completed: false,
                progress: 0,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
            },
            {
                id: 'challenge-2',
                title: 'Task Kickstart',
                description: 'Complete any two tasks from your to-do list today.',
                category: 'To-Do',
                difficulty: 2,
                link: '../to_do_list/index.html',
                completed: false,
                progress: 0,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
            },
            {
                id: 'challenge-3',
                title: 'Mental Health Check-in',
                description: 'Take a quick mental health assessment to see how you\'re doing.',
                category: 'Assessment',
                difficulty: 2,
                link: '../mental_health_quiz/index.html',
                completed: false,
                progress: 0,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
            },
            {
                id: 'challenge-4',
                title: 'Quick Meditation',
                description: 'Take 3 minutes for a quick mindfulness meditation.',
                category: 'Mindfulness',
                difficulty: 1,
                link: '../meditation/index.html',
                completed: false,
                progress: 0,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
            },
            {
                id: 'challenge-5',
                title: 'Inspirational Quote',
                description: 'Find a quote that resonates with you today and save it to your favorites.',
                category: 'Growth',
                difficulty: 1,
                link: '../know_yourself/index.html#motivation',
                completed: false,
                progress: 0,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
            }
        ];
    }

    /**
     * Get insights for the current user
     * @returns {Promise<Array>} Array of insight objects
     */
    async getInsights() {
        try {
            console.log('Fetching insights from API...');

            try {
                const response = await window.api.get('/daily-boost/insights');
                console.log('Insights fetched successfully:', response.data);
                return response.data;
            } catch (apiError) {
                console.error('API error, using mock data:', apiError);
                return this.getMockInsights();
            }
        } catch (error) {
            console.error('Error fetching insights:', error);
            // If API fails, return mock data
            return this.getMockInsights();
        }
    }

    /**
     * Get mock insights for testing
     * @returns {Array} Array of mock insight objects
     */
    getMockInsights() {
        console.log('Using mock insights data');

        return [
            {
                id: 'insight-1',
                title: 'Your Growth Journey',
                content: 'Consistent small steps lead to meaningful progress. Keep going!',
                source: 'Daily Boost',
                category: 'general',
                createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
                isUnlocked: true
            },
            {
                id: 'insight-2',
                title: 'Self-Understanding',
                content: 'Regular self-assessment helps track your mental wellbeing. Keep checking in with yourself.',
                source: 'Mental Health Quiz',
                category: 'quiz',
                createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
                isUnlocked: true
            }
        ];
    }

    /**
     * Get daily boost stats for the current user
     * @returns {Promise<Object>} Stats object
     */
    async getStats() {
        try {
            console.log('Fetching stats from API...');

            try {
                const response = await window.api.get('/daily-boost/stats');
                console.log('Stats fetched successfully:', response.data);
                return response.data;
            } catch (apiError) {
                console.error('API error, using mock data:', apiError);
                return this.getMockStats();
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            // If API fails, return mock stats
            return this.getMockStats();
        }
    }

    /**
     * Get mock stats for testing
     * @returns {Object} Mock stats object
     */
    getMockStats() {
        console.log('Using mock stats data');

        return {
            streak: 3,
            completionPercentage: 40,
            insightsCount: 2,
            totalChallengesCompleted: 12,
            completedToday: ['challenge-2']
        };
    }

    /**
     * Complete a challenge
     * @param {string} challengeId - ID of the challenge to complete
     * @returns {Promise<Object>} Updated challenge object
     */
    async completeChallenge(challengeId) {
        try {
            console.log(`Completing challenge ${challengeId}...`);

            let completedChallenge;
            try {
                const response = await window.api.post(`/daily-boost/complete/${challengeId}`);
                console.log('Challenge completed successfully:', response.data);
                completedChallenge = response.data;
            } catch (apiError) {
                console.error('API error, using mock data:', apiError);
                completedChallenge = this.mockCompleteChallenge(challengeId);
            }

            // After completing the challenge, update the corresponding todo item
            try {
                await this.updateTodoForCompletedChallenge(completedChallenge);
            } catch (todoError) {
                console.error('Error updating todo item for completed challenge:', todoError);
            }

            return completedChallenge;
        } catch (error) {
            console.error('Error completing challenge:', error);
            const completedChallenge = this.mockCompleteChallenge(challengeId);

            // Try to update the todo item even in mock mode
            try {
                await this.updateTodoForCompletedChallenge(completedChallenge);
            } catch (todoError) {
                console.error('Error updating todo item for completed challenge in mock mode:', todoError);
            }

            return completedChallenge;
        }
    }

    /**
     * Update the todo item for a completed challenge
     * @param {Object} challenge - The completed challenge
     * @returns {Promise<Object>} Updated todo item
     */
    async updateTodoForCompletedChallenge(challenge) {
        if (!challenge) {
            console.warn('No challenge provided to update todo item');
            return null;
        }

        try {
            console.log('Finding and updating todo item for completed challenge:', challenge.title || challenge.id);

            // First, get all todo items
            let todoItems;
            try {
                const response = await window.api.get('/todos');
                todoItems = response.data;
            } catch (apiError) {
                console.error('API error getting todo items, using mock data:', apiError);
                // In a real implementation, we would have a method to get mock todo items
                todoItems = [];
                return null;
            }

            // Find todo items that match this challenge (by title/text and Daily Boost tag)
            const matchingTodos = todoItems.filter(todo => {
                // Check if the todo item has the Daily Boost tag
                const hasDailyBoostTag = todo.tags &&
                    todo.tags.some(tag => tag.toLowerCase() === 'daily boost');

                // Check if the title matches
                const titleMatches = todo.text && challenge.title &&
                    todo.text.toLowerCase() === challenge.title.toLowerCase();

                return hasDailyBoostTag && titleMatches;
            });

            if (matchingTodos.length === 0) {
                console.log('No matching todo items found for challenge:', challenge.title || challenge.id);
                return null;
            }

            // Update the first matching todo item
            const todoToUpdate = matchingTodos[0];
            console.log('Found matching todo item:', todoToUpdate);

            // Mark it as completed
            todoToUpdate.completed = true;

            // Update the todo item
            try {
                const response = await window.api.put(`/todos/${todoToUpdate.id}`, todoToUpdate);
                console.log('Todo item updated successfully:', response.data);
                return response.data;
            } catch (updateError) {
                console.error('Error updating todo item:', updateError);
                return null;
            }
        } catch (error) {
            console.error('Error updating todo for completed challenge:', error);
            return null;
        }
    }

    /**
     * Mock completing a challenge
     * @param {string} challengeId - ID of the challenge to complete
     * @returns {Object} Updated challenge object
     */
    mockCompleteChallenge(challengeId) {
        console.log(`Mock completing challenge ${challengeId}`);

        // Find the challenge in the mock challenges
        const challenges = this.getMockChallenges();

        // Try to find the challenge by ID
        let challenge = challenges.find(c => c.id === challengeId);

        // If not found, just use the first challenge as a fallback
        if (!challenge) {
            console.warn(`Challenge ${challengeId} not found in mock data, using first challenge as fallback`);
            challenge = challenges[0];

            if (!challenge) {
                console.error('No challenges available in mock data');
                throw new Error('No challenges available');
            }

            // Clone the challenge to avoid modifying the original
            challenge = { ...challenge, id: challengeId };
        }

        // Update the challenge
        challenge.completed = true;
        challenge.completedAt = new Date().toISOString();
        challenge.progress = 100;

        return challenge;
    }

    /**
     * Update challenge progress
     * @param {string} challengeId - ID of the challenge to update
     * @param {number} progress - Progress percentage (0-100)
     * @returns {Promise<Object>} Updated challenge object
     */
    async updateProgress(challengeId, progress) {
        try {
            console.log(`Updating progress for challenge ${challengeId} to ${progress}%...`);

            try {
                const response = await window.api.post('/daily-boost/progress', {
                    challengeId,
                    progress
                });
                console.log('Progress updated successfully:', response.data);
                return response.data;
            } catch (apiError) {
                console.error('API error, using mock data:', apiError);
                return this.mockUpdateProgress(challengeId, progress);
            }
        } catch (error) {
            console.error('Error updating challenge progress:', error);
            return this.mockUpdateProgress(challengeId, progress);
        }
    }

    /**
     * Mock updating challenge progress
     * @param {string} challengeId - ID of the challenge to update
     * @param {number} progress - Progress percentage (0-100)
     * @returns {Object} Updated challenge object
     */
    mockUpdateProgress(challengeId, progress) {
        console.log(`Mock updating progress for challenge ${challengeId} to ${progress}%`);

        // Find the challenge in the mock challenges
        const challenges = this.getMockChallenges();

        // Try to find the challenge by ID
        let challenge = challenges.find(c => c.id === challengeId);

        // If not found, just use the first challenge as a fallback
        if (!challenge) {
            console.warn(`Challenge ${challengeId} not found in mock data, using first challenge as fallback`);
            challenge = challenges[0];

            if (!challenge) {
                console.error('No challenges available in mock data');
                throw new Error('No challenges available');
            }

            // Clone the challenge to avoid modifying the original
            challenge = { ...challenge, id: challengeId };
        }

        // Update the challenge
        challenge.progress = progress;

        // If progress is 100%, mark as completed
        if (progress >= 100) {
            challenge.completed = true;
            challenge.completedAt = new Date().toISOString();
        }

        return challenge;
    }

    /**
     * Add a challenge to the user's todo list
     * @param {Object} challenge - Challenge object to add to todo list
     * @returns {Promise<Object>} Created todo item
     */
    async addToTodo(challenge) {
        try {
            console.log('Adding challenge to todo list:', challenge);

            // Create a todo item from the challenge
            // The backend expects a LocalDateTime for dueDate, so we need to send a full ISO string
            let dueDate = new Date();
            dueDate.setHours(23, 59, 59, 999); // Set to end of day

            // Try to use the challenge's expiration date if it's valid
            try {
                if (challenge.expiresAt) {
                    const expiryDate = new Date(challenge.expiresAt);
                    if (!isNaN(expiryDate.getTime())) {
                        dueDate = expiryDate;
                    }
                }
            } catch (dateError) {
                console.warn('Invalid expiry date, using today instead:', dateError);
            }

            const todoItem = {
                text: challenge.title, // The backend expects 'text' instead of 'title'
                notes: challenge.description, // Use notes for the description
                priority: challenge.difficulty || 2,
                dueDate: dueDate, // Send the Date object directly
                tags: ['Daily Boost'], // Use tags instead of category
                completed: false
            };

            console.log('Created todo item:', todoItem);

            try {
                // Call the todo API to create the item
                const response = await window.api.post('/todos', todoItem);
                console.log('Todo item created successfully:', response.data);
                return response.data;
            } catch (apiError) {
                console.error('API error, using mock data:', apiError);
                return this.mockAddToTodo(challenge);
            }
        } catch (error) {
            console.error('Error adding challenge to todo list:', error);
            return this.mockAddToTodo(challenge);
        }
    }

    /**
     * Mock adding a challenge to the todo list
     * @param {Object} challenge - Challenge to add to todo list
     * @returns {Object} Created todo item
     */
    mockAddToTodo(challenge) {
        console.log('Mock adding challenge to todo list:', challenge);

        // Create a mock todo item
        // The backend expects a LocalDateTime for dueDate, so we need to send a full ISO string
        let dueDate = new Date();
        dueDate.setHours(23, 59, 59, 999); // Set to end of day

        // Try to use the challenge's expiration date if it's valid
        try {
            if (challenge.expiresAt) {
                const expiryDate = new Date(challenge.expiresAt);
                if (!isNaN(expiryDate.getTime())) {
                    dueDate = expiryDate;
                }
            }
        } catch (dateError) {
            console.warn('Invalid expiry date in mock, using today instead:', dateError);
        }

        const todoItem = {
            id: 'todo-' + Date.now(),
            text: challenge.title, // The backend expects 'text' instead of 'title'
            notes: challenge.description, // Use notes for the description
            priority: challenge.difficulty || 2,
            dueDate: dueDate, // Send the Date object directly
            tags: ['Daily Boost'], // Use tags instead of category
            completed: false,
            createdAt: new Date()
        };

        console.log('Created mock todo item:', todoItem);

        return todoItem;
    }

}

// Create and export a singleton instance
const dailyBoostService = new DailyBoostService();
window.dailyBoostService = dailyBoostService;