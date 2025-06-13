

// Use the correct backend URL
const API_BASE_URL = 'http://localhost:8080/api';

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000 // 10 seconds
});

// Add fallback mode for development/testing without a backend
// Set to false by default - we'll detect if backend is unavailable
let fallbackMode = false;

// Expose fallback mode as a property of the api object
Object.defineProperty(api, 'fallbackMode', {
    get: function() { return fallbackMode; },
    set: function(value) {
        console.log(`Setting fallback mode to: ${value}`);
        fallbackMode = value;

        // Store fallback mode in localStorage so it persists across page loads
        localStorage.setItem('api_fallback_mode', value ? 'true' : 'false');
    }
});

// Add a method to check if we're in fallback mode
api.isInFallbackMode = function() {
    return fallbackMode;
};

// Always disable fallback mode
console.log('Disabling fallback mode');
localStorage.setItem('api_fallback_mode', 'false');
fallbackMode = false;

// Add a request interceptor for authentication and debugging
api.interceptors.request.use(
    (config) => {
        // Check if we're in fallback mode
        if (fallbackMode) {
            console.log(`[Fallback Mode] Intercepted request to: ${config.method.toUpperCase()} ${config.url}`);

            // Special handling for login/signup requests
            if (config.url.includes('/users/login') ||
                (config.url.includes('/users') && config.method.toLowerCase() === 'post')) {
                console.log(`[Fallback Mode] Allowing login/signup request: ${config.method.toUpperCase()} ${config.url}`);
                // Let these through to be handled by the response interceptor
                return config;
            }

            // Special handling for quiz results
            if (config.url.includes('/quiz-results/') && config.method.toLowerCase() === 'post') {
                console.log(`[Fallback Mode] Allowing quiz result submission: ${config.method.toUpperCase()} ${config.url}`);
                // Let these through to be handled by the response interceptor
                return config;
            }

            // For GET requests, we'll let them through to be handled by the response interceptor
            // For other methods, we'll reject immediately with a custom error
            if (config.method.toLowerCase() !== 'get') {
                console.log(`[Fallback Mode] Rejecting non-GET request: ${config.method.toUpperCase()} ${config.url}`);
                return Promise.reject({
                    fallbackMode: true,
                    message: 'Request rejected in fallback mode',
                    config
                });
            }
        }

        // Add auth token to all requests
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log the request for debugging
        console.log(`Making request to: ${config.method.toUpperCase()} ${config.url}`);

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`Received response from: ${response.config.url}`, response.status);
        return response;
    },
    (error) => {
        // Check if this is a custom fallback mode error from the request interceptor
        if (error.fallbackMode) {
            console.warn('[Fallback Mode] Request rejected:', error.config.method.toUpperCase(), error.config.url);
            return Promise.reject(error);
        }

        // If we're in fallback mode, handle GET requests and quiz submissions specially
        if (fallbackMode && error.config) {
            // Handle GET requests
            if (error.config.method.toLowerCase() === 'get') {
                console.warn('[Fallback Mode] GET request failed, returning empty data:', error.config.url);

                // Return a mock successful response with empty data
                return Promise.resolve({
                    data: [],
                    status: 200,
                    statusText: 'OK (Fallback)',
                    headers: {},
                    config: error.config,
                    fallbackData: true
                });
            }

            // Handle quiz result submissions
            if (error.config.method.toLowerCase() === 'post' && error.config.url.includes('/quiz-results/')) {
                console.warn('[Fallback Mode] Quiz submission failed, returning mock response:', error.config.url);

                try {
                    // Parse the submitted quiz result
                    const quizResult = JSON.parse(error.config.data);

                    // Generate a mock ID for the result
                    quizResult.id = 'fallback-' + Math.random().toString(36).substring(2);

                    // Add a timestamp if not present
                    if (!quizResult.takenAt) {
                        quizResult.takenAt = new Date().toISOString();
                    }

                    // Store in localStorage for persistence
                    const storageKey = 'fallback_quiz_results';
                    let storedResults = JSON.parse(localStorage.getItem(storageKey) || '[]');
                    storedResults.push(quizResult);
                    localStorage.setItem(storageKey, JSON.stringify(storedResults));

                    // Return a successful response with the saved data
                    return Promise.resolve({
                        data: quizResult,
                        status: 201,
                        statusText: 'Created (Fallback)',
                        headers: {},
                        config: error.config,
                        fallbackData: true
                    });
                } catch (parseError) {
                    console.error('[Fallback Mode] Error parsing quiz result:', parseError);
                }
            }
        }

        // Handle common errors here
        if (error.response) {
            // Server responded with an error status
            console.error('API Error:', error.response.status, error.response.data);

            // Don't enable fallback mode automatically
            if (error.response.status === 404 || error.response.status === 405) {
                console.log('API endpoint not available, but continuing to use real backend');
                // Do not enable fallback mode
            }

            // Handle authentication errors
            if (error.response.status === 401) {
                // Clear auth data and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');

                // Only redirect if not already on the login page
                if (!window.location.href.includes('/login/')) {
                    window.location.href = '/login/login.html';
                }
            }

            // Handle forbidden errors
            else if (error.response.status === 403) {
                console.error('Access denied:', error.config.url);
                alert('You do not have permission to perform this action.');
            }

            // Handle not found errors
            else if (error.response.status === 404) {
                console.error('Resource not found:', error.config.url);
            }

            // Handle method not allowed
            else if (error.response.status === 405) {
                console.error('Method not allowed:', error.config.method, error.config.url);
            }

            // Handle validation errors
            else if (error.response.status === 422) {
                console.error('Validation error:', error.response.data);
            }

            // Handle server errors
            else if (error.response.status >= 500) {
                console.error('Server error:', error.response.data);
                alert('A server error occurred. Please try again later.');
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network Error:', error.request);

            // Don't enable fallback mode
            console.log('Network error occurred, but continuing to use real backend');

            // Don't handle login/signup requests specially - let them fail
            if (error.config && (
                error.config.url.includes('/users/login') ||
                error.config.url.includes('/users') && error.config.method === 'post'
            )) {
                console.log('Login/signup request failed - please make sure the backend is running');

                // Let the error propagate
                return Promise.reject(error);
            }

            // Show a more helpful message for other requests
            if (!window.location.href.includes('/login/')) {
                alert('Network error: Could not connect to the server. Please make sure the backend is running.');
            }
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Helper methods for common API operations
api.helpers = {
    /**
     * Handle API errors in a consistent way
     * @param {Error} error - The error object
     * @param {string} defaultMessage - Default message to show if error doesn't have a response
     * @returns {string} - Error message to display
     */
    getErrorMessage: (error, defaultMessage = 'An error occurred. Please try again.') => {
        if (error.response && error.response.data) {
            if (typeof error.response.data === 'string') {
                return error.response.data;
            }
            if (error.response.data.message) {
                return error.response.data.message;
            }
            if (error.response.data.error) {
                return error.response.data.error;
            }
            if (typeof error.response.data === 'object') {
                return Object.values(error.response.data).join(', ');
            }
        }
        return defaultMessage;
    }
};

const isLocalDevelopment = window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1' ||
                          window.location.protocol === 'file:';

// Only enable fallback mode if we can't connect to the backend
// We'll try to detect this automatically on the first request
console.log('Checking if backend is available...');
api.fallbackMode = false;

// Check if the backend is available
// Disable automatic fallback mode detection
console.log('Skipping backend availability check - forcing use of real backend');

// Force fallback mode to false to ensure we use the real backend
console.log('Forcing fallback mode to false to use the real backend');
api.fallbackMode = false;

// Add a method to check if user is authenticated
api.isAuthenticated = function() {
    return !!localStorage.getItem('token');
};

// Log that API is initialized
console.log('API service initialized successfully');

// Add a method to check if the API is ready
api.isReady = function() {
    return true;
};

// Export the configured axios instance
window.api = api; // For direct browser usage
// Note: ES module exports are commented out for browser compatibility
// export { api }; // For ES modules
// export default api; // For module bundlers
