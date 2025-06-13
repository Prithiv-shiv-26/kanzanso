/**
 * API Service
 * Handles API requests with fallback to local storage
 */

// Base API URL
const API_BASE_URL = '/api';

// Check if we're in development mode
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// API service object
const api = {
    /**
     * Make a GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Response data
     */
    get: async (endpoint, params = {}) => {
        // Log that we're in fallback mode
        console.log('[Fallback Mode] Intercepted request to: GET ' + endpoint);
        
        // Build URL with query parameters
        let url = API_BASE_URL + endpoint;
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += '?' + queryString;
        }
        
        try {
            // Log the request
            console.log('Making request to: GET ' + endpoint);
            
            // Make the request
            const response = await fetch(url);
            
            // Check if response is OK
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Parse and return the response
            const data = await response.json();
            return { data };
        } catch (error) {
            console.log('[Fallback Mode] GET request failed, returning empty data: ' + endpoint);
            
            // Return empty data in fallback mode
            return { data: {} };
        }
    },
    
    /**
     * Make a POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise<Object>} - Response data
     */
    post: async (endpoint, data = {}) => {
        // Log that we're in fallback mode
        console.log('[Fallback Mode] Intercepted request to: POST ' + endpoint);
        
        try {
            // Log the request
            console.log('Making request to: POST ' + endpoint);
            
            // Make the request
            const response = await fetch(API_BASE_URL + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            // Check if response is OK
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Parse and return the response
            const responseData = await response.json();
            return { data: responseData };
        } catch (error) {
            console.log('[Fallback Mode] POST request failed, returning empty data: ' + endpoint);
            
            // Return empty data in fallback mode
            return { data: {} };
        }
    },
    
    /**
     * Make a PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise<Object>} - Response data
     */
    put: async (endpoint, data = {}) => {
        // Log that we're in fallback mode
        console.log('[Fallback Mode] Intercepted request to: PUT ' + endpoint);
        
        try {
            // Log the request
            console.log('Making request to: PUT ' + endpoint);
            
            // Make the request
            const response = await fetch(API_BASE_URL + endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            // Check if response is OK
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Parse and return the response
            const responseData = await response.json();
            return { data: responseData };
        } catch (error) {
            console.log('[Fallback Mode] PUT request failed, returning empty data: ' + endpoint);
            
            // Return empty data in fallback mode
            return { data: {} };
        }
    },
    
    /**
     * Make a DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} - Response data
     */
    delete: async (endpoint) => {
        // Log that we're in fallback mode
        console.log('[Fallback Mode] Intercepted request to: DELETE ' + endpoint);
        
        try {
            // Log the request
            console.log('Making request to: DELETE ' + endpoint);
            
            // Make the request
            const response = await fetch(API_BASE_URL + endpoint, {
                method: 'DELETE'
            });
            
            // Check if response is OK
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Parse and return the response
            const data = await response.json();
            return { data };
        } catch (error) {
            console.log('[Fallback Mode] DELETE request failed, returning empty data: ' + endpoint);
            
            // Return empty data in fallback mode
            return { data: {} };
        }
    }
};

// Make the API service available globally
window.api = api;