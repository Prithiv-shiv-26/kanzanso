/**
 * User service for handling user-related API calls
 * This file contains methods for user CRUD operations and activity tracking
 */

// Use the api instance from api.js
// For direct browser usage, make sure api.js is included before this file

const userService = {
    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Promise with the user data and token
     */
    login: async (email, password) => {
        try {
            // Check if we're in fallback mode
            if (api.fallbackMode) {
                console.log('Using fallback mode for login');

                // For demo purposes, accept any login with valid format
                if (email && password && password.length >= 6) {
                    // Generate a mock token
                    const mockToken = 'demo-token-' + Math.random().toString(36).substring(2);
                    // Use the actual user ID from the database
                    const userId = '68052ca31a411b19ce4db257';
                    const userName = 'Prithiv Shiv M V'; // Use the actual user name
                    const userEmail = 'prithivshiv26@gmail.com'; // Use the actual user email

                    // Store auth token and user info in localStorage
                    localStorage.setItem('token', mockToken);
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('userName', userName);
                    localStorage.setItem('userEmail', userEmail);

                    console.log('Stored demo user in localStorage:', {
                        token: mockToken.substring(0, 10) + '...',
                        userId,
                        userName,
                        userEmail
                    });

                    return {
                        id: userId,
                        name: userName,
                        email: userEmail,
                        token: mockToken
                    };
                } else {
                    throw new Error('Please enter a valid email and password (min 6 characters)');
                }
            }

            // If not in fallback mode, proceed with normal login
            const response = await api.post('/users/login', { email, password });

            // Store auth token and user info in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.id);
            localStorage.setItem('userName', response.data.name);
            localStorage.setItem('userEmail', response.data.email);

            return response.data;
        } catch (error) {
            console.error('Error logging in:', error);

            // If this is a network error or 404/405 error, switch to fallback mode and try again
            if (error.request && !error.response) {
                console.log('Network error, switching to fallback mode for login');
                api.fallbackMode = true;
                return userService.login(email, password);
            }

            if (error.response && (error.response.status === 404 || error.response.status === 405)) {
                console.log('API endpoint not available, switching to fallback mode for login');
                api.fallbackMode = true;
                return userService.login(email, password);
            }

            throw error;
        }
    },

    /**
     * Logout user
     * @returns {Promise} - Promise with logout status
     */
    logout: async () => {
        try {
            // Check if we're in fallback mode
            if (api.fallbackMode) {
                console.log('Using fallback mode for logout');

                // Clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');

                return { success: true };
            }

            // If not in fallback mode, proceed with normal logout
            const response = await api.post('/users/logout');

            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');

            return response.data;
        } catch (error) {
            console.error('Error logging out:', error);

            // Clear auth data even if API call fails
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');

            throw error;
        }
    },
    /**
     * Create a new user
     * @param {Object} userData - User data including name, email, password
     * @returns {Promise} - Promise with the created user data
     */
    createUser: async (userData) => {
        try {
            // Check if we're in fallback mode
            if (api.fallbackMode) {
                console.log('Using fallback mode for createUser');

                // Generate a mock token and user ID
                const mockToken = 'demo-token-' + Math.random().toString(36).substring(2);
                // Use the actual user ID from the database
                const userId = '68052ca31a411b19ce4db257';

                // Store auth data in localStorage
                localStorage.setItem('token', mockToken);
                localStorage.setItem('userId', userId);
                localStorage.setItem('userName', userData.name);
                localStorage.setItem('userEmail', userData.email);

                return {
                    id: userId,
                    name: userData.name,
                    email: userData.email,
                    createdAt: new Date().toISOString()
                };
            }

            const response = await api.post('/users', userData);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);

            // If this is a network error, switch to fallback mode
            if (error.request && !error.response) {
                console.log('Network error, switching to fallback mode for createUser');
                api.fallbackMode = true;
                return userService.createUser(userData);
            }

            throw error;
        }
    },

    /**
     * Get user by ID
     * @param {string} id - User ID
     * @returns {Promise} - Promise with the user data
     */
    getUserById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error getting user with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Get user by email
     * @param {string} email - User email
     * @returns {Promise} - Promise with the user data
     */
    getUserByEmail: async (email) => {
        try {
            const response = await api.get(`/users/email/${email}`);
            return response.data;
        } catch (error) {
            console.error(`Error getting user with email ${email}:`, error);
            throw error;
        }
    },

    /**
     * Get all users
     * @returns {Promise} - Promise with array of users
     */
    getAllUsers: async () => {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    },

    /**
     * Update user
     * @param {string} id - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise} - Promise with the updated user data
     */
    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            console.error(`Error updating user with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete user
     * @param {string} id - User ID
     * @returns {Promise} - Promise with no content
     */
    deleteUser: async (id) => {
        try {
            await api.delete(`/users/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting user with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Check if email exists
     * @param {string} email - Email to check
     * @returns {Promise<boolean>} - Promise with boolean indicating if email exists
     */
    checkEmailExists: async (email) => {
        try {
            const response = await api.get(`/users/exists/${email}`);
            return response.data;
        } catch (error) {
            console.error(`Error checking if email ${email} exists:`, error);
            throw error;
        }
    },

    /**
     * Get the current user's data
     * @returns {Promise} - Promise with user data
     */
    getCurrentUser: async () => {
        try {
            const response = await api.get('/users/current');
            return response.data;
        } catch (error) {
            console.error('Error getting current user:', error);

            // Return basic user data from local storage
            const userId = localStorage.getItem('userId') || 'guest';
            const userName = localStorage.getItem('userName') || 'Guest User';
            const userEmail = localStorage.getItem('userEmail') || '';

            return {
                id: userId,
                name: userName,
                email: userEmail,
                isGuest: userId === 'guest'
            };
        }
    },

    /**
     * Get user activity data for personalization
     * @param {string} userId - User ID
     * @returns {Promise} - Promise with user activity data
     */
    getUserActivityData: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/activity`);
            return response.data;
        } catch (error) {
            console.error(`Error getting activity data for user ${userId}:`, error);

            // Return data from local storage
            return {
                lastJournalDate: localStorage.getItem('lastJournalDate'),
                lastQuizDate: localStorage.getItem('lastQuizDate'),
                lastMeditationDate: localStorage.getItem('lastMeditationDate'),
                completedTodos: JSON.parse(localStorage.getItem('completedTodos') || '[]'),
                moodEntries: JSON.parse(localStorage.getItem('moodEntries') || '[]'),
                quizResults: JSON.parse(localStorage.getItem('quizResults') || '[]')
            };
        }
    },

    /**
     * Update user activity data
     * @param {string} activityType - Type of activity (journal, quiz, meditation, todo, mood)
     * @param {Object} data - Activity data
     * @returns {Promise} - Promise with updated activity data
     */
    updateUserActivity: async (activityType, data) => {
        try {
            const userId = localStorage.getItem('userId') || 'guest';
            const response = await api.post(`/users/${userId}/activity/${activityType}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating ${activityType} activity:`, error);

            // Update local storage based on activity type
            const now = new Date().toISOString();

            switch (activityType) {
                case 'journal':
                    localStorage.setItem('lastJournalDate', now);

                    // Store journal entry
                    const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                    journalEntries.push({
                        id: 'journal-' + Date.now(),
                        content: data.content,
                        emotions: data.emotions || [],
                        date: now
                    });
                    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
                    break;

                case 'quiz':
                    localStorage.setItem('lastQuizDate', now);

                    // Store quiz result
                    const quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
                    quizResults.push({
                        id: 'quiz-' + Date.now(),
                        quizType: data.quizType,
                        resultSummary: data.resultSummary,
                        score: data.score,
                        date: now
                    });
                    localStorage.setItem('quizResults', JSON.stringify(quizResults));
                    break;

                case 'meditation':
                    localStorage.setItem('lastMeditationDate', now);
                    break;

                case 'todo':
                    // Store completed todo
                    const completedTodos = JSON.parse(localStorage.getItem('completedTodos') || '[]');
                    completedTodos.push({
                        id: data.id || 'todo-' + Date.now(),
                        title: data.title,
                        category: data.category,
                        priority: data.priority,
                        date: now
                    });
                    localStorage.setItem('completedTodos', JSON.stringify(completedTodos));
                    break;

                case 'mood':
                    // Store mood entry
                    const moodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
                    moodEntries.push({
                        id: 'mood-' + Date.now(),
                        mood: data.mood,
                        intensity: data.intensity,
                        factors: data.factors || [],
                        date: now
                    });
                    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
                    break;
            }

            return {
                success: true,
                message: `${activityType} activity updated locally`,
                date: now
            };
        }
    }
};

// Make the service available globally for direct browser usage
window.userService = userService;
