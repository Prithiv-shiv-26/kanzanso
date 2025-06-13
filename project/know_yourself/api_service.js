/**
 * API Service for the Know Yourself section
 * Handles all API calls to the backend for quotes, mood tracking, gratitude journal, etc.
 */

// Import configuration
import { API_BASE_URL, DEFAULT_FALLBACK_MODE, DEFAULT_USER_ID } from './config.js';

// Create a simple API client using fetch
const api = {
    fallbackMode: DEFAULT_FALLBACK_MODE,

    async get(url) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return { data }; // Return in format compatible with axios
    },

    async post(url, data) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const responseData = await response.json();
        return { data: responseData }; // Return in format compatible with axios
    },

    async put(url, data) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const responseData = await response.json();
        return { data: responseData }; // Return in format compatible with axios
    },

    async delete(url) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        if (response.status === 204) {
            return { data: null }; // Return in format compatible with axios
        }

        const responseData = await response.json();
        return { data: responseData }; // Return in format compatible with axios
    }
}

// Get the authentication token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// Get the user ID from localStorage or use default
function getUserId() {
    return localStorage.getItem('userId') || DEFAULT_USER_ID;
}

// Check if we should use fallback mode (localStorage)
async function shouldUseFallback() {
    // Reset fallback mode to false on each check
    api.fallbackMode = false;

    // Check if the backend is available
    try {
        // Try to fetch from the quotes endpoint
        const response = await fetch(`${API_BASE_URL}/quotes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Backend API is available');
            return false; // Backend is available, don't use fallback
        } else {
            console.warn('Backend API returned error status:', response.status);
            api.fallbackMode = true;
            return true;
        }
    } catch (error) {
        console.warn('Backend API not available, using fallback mode:', error.message);
        api.fallbackMode = true;
        return true;
    }
}

// Log API calls for debugging
function logApiCall(method, url, data) {
    console.log(`API ${method} ${url}`, data || '');
}

// Log API responses for debugging
function logApiResponse(method, url, response) {
    console.log(`API ${method} ${url} response:`, response);
}

// Log API errors for debugging
function logApiError(method, url, error) {
    console.error(`API ${method} ${url} error:`, error);
}

// ===== QUOTES API =====

// Get all quotes
async function fetchQuotes() {
    const url = '/quotes';
    logApiCall('GET', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for quotes');
        return getQuotesFromLocalStorage();
    }

    try {
        const response = await api.get(url);
        logApiResponse('GET', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('GET', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for quotes');
        api.fallbackMode = true;
        return getQuotesFromLocalStorage();
    }
}

// Get a random quote
async function fetchRandomQuote() {
    // Try to get a quote from a hardcoded list of quotes first
    try {
        console.log('Using hardcoded quotes for variety');

        // Hardcoded list of quotes for variety
        const hardcodedQuotes = [
            {
                id: 'hq1',
                text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
                author: 'Nelson Mandela',
                category: 'inspiration'
            },
            {
                id: 'hq2',
                text: 'The way to get started is to quit talking and begin doing.',
                author: 'Walt Disney',
                category: 'motivation'
            },
            {
                id: 'hq3',
                text: 'Your time is limited, so don\'t waste it living someone else\'s life.',
                author: 'Steve Jobs',
                category: 'life'
            },
            {
                id: 'hq4',
                text: 'If life were predictable it would cease to be life, and be without flavor.',
                author: 'Eleanor Roosevelt',
                category: 'life'
            },
            {
                id: 'hq5',
                text: 'If you look at what you have in life, you\'ll always have more. If you look at what you don\'t have in life, you\'ll never have enough.',
                author: 'Oprah Winfrey',
                category: 'gratitude'
            },
            {
                id: 'hq6',
                text: 'If you set your goals ridiculously high and it\'s a failure, you will fail above everyone else\'s success.',
                author: 'James Cameron',
                category: 'goals'
            },
            {
                id: 'hq7',
                text: 'Life is what happens when you\'re busy making other plans.',
                author: 'John Lennon',
                category: 'life'
            },
            {
                id: 'hq8',
                text: 'Spread love everywhere you go. Let no one ever come to you without leaving happier.',
                author: 'Mother Teresa',
                category: 'love'
            },
            {
                id: 'hq9',
                text: 'When you reach the end of your rope, tie a knot in it and hang on.',
                author: 'Franklin D. Roosevelt',
                category: 'perseverance'
            },
            {
                id: 'hq10',
                text: 'Always remember that you are absolutely unique. Just like everyone else.',
                author: 'Margaret Mead',
                category: 'humor'
            },
            {
                id: 'hq11',
                text: 'Don\'t judge each day by the harvest you reap but by the seeds that you plant.',
                author: 'Robert Louis Stevenson',
                category: 'wisdom'
            },
            {
                id: 'hq12',
                text: 'The future belongs to those who believe in the beauty of their dreams.',
                author: 'Eleanor Roosevelt',
                category: 'dreams'
            },
            {
                id: 'hq13',
                text: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.',
                author: 'Benjamin Franklin',
                category: 'learning'
            },
            {
                id: 'hq14',
                text: 'The best and most beautiful things in the world cannot be seen or even touched — they must be felt with the heart.',
                author: 'Helen Keller',
                category: 'beauty'
            },
            {
                id: 'hq15',
                text: 'It is during our darkest moments that we must focus to see the light.',
                author: 'Aristotle',
                category: 'hope'
            }
        ];

        // Get a random quote from the hardcoded list
        const randomIndex = Math.floor(Math.random() * hardcodedQuotes.length);
        const randomQuote = hardcodedQuotes[randomIndex];

        // Add a timestamp to the ID to ensure uniqueness
        randomQuote.id = `${randomQuote.id}_${Date.now()}`;

        console.log('Using hardcoded quote for variety:', randomQuote.text);
        return randomQuote;
    } catch (hardcodedError) {
        console.warn('Error using hardcoded quotes:', hardcodedError.message);

        // If hardcoded quotes fail, try the backend API
        const internalUrl = '/quotes/random';
        logApiCall('GET', internalUrl);

        // Check if we should use fallback mode
        const useFallback = await shouldUseFallback();
        if (useFallback) {
            console.warn('Using fallback mode for random quote');
            return getRandomQuoteFromLocalStorage();
        }

        try {
            const response = await api.get(internalUrl);
            logApiResponse('GET', internalUrl, response.data);
            return response.data;
        } catch (internalError) {
            logApiError('GET', internalUrl, internalError);

            // If backend API fails, switch to fallback mode
            console.warn('API calls failed, falling back to localStorage for random quote');
            api.fallbackMode = true;
            return getRandomQuoteFromLocalStorage();
        }
    }
}

// Get favorite quotes for the current user
async function fetchFavoriteQuotes() {
    const userId = getUserId();
    const url = `/favorite-quotes?userId=${userId}`;
    logApiCall('GET', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for favorite quotes');
        return getFavoriteQuotesFromLocalStorage();
    }

    try {
        const response = await api.get(url);
        logApiResponse('GET', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('GET', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for favorite quotes');
        api.fallbackMode = true;
        return getFavoriteQuotesFromLocalStorage();
    }
}

// Add a quote to favorites
async function addFavoriteQuote(quote) {
    const userId = getUserId();
    const url = '/favorite-quotes';
    logApiCall('POST', url, quote);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for adding favorite quote');
        return addFavoriteQuoteToLocalStorage(quote);
    }

    try {
        const favoriteQuote = {
            userId: userId,
            quoteId: quote.id || Date.now().toString(),
            text: quote.text,
            author: quote.author,
            category: quote.category
        };

        const response = await api.post(url, favoriteQuote);
        logApiResponse('POST', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('POST', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for adding favorite quote');
        api.fallbackMode = true;
        return addFavoriteQuoteToLocalStorage(quote);
    }
}

// Remove a quote from favorites
async function removeFavoriteQuote(quoteId) {
    const userId = getUserId();
    // The backend expects userId and quoteId as query parameters
    const url = `/favorite-quotes?userId=${userId}&quoteId=${quoteId}`;
    logApiCall('DELETE', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for removing favorite quote');
        return removeFavoriteQuoteFromLocalStorage(quoteId);
    }

    try {
        // Make a DELETE request with the correct URL format
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        logApiResponse('DELETE', url, 'Success');
        return true;
    } catch (error) {
        logApiError('DELETE', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for removing favorite quote');
        api.fallbackMode = true;
        return removeFavoriteQuoteFromLocalStorage(quoteId);
    }
}

// Check if a quote is in favorites
async function checkFavoriteQuote(quoteId) {
    // If quoteId is undefined, return false
    if (!quoteId) {
        console.warn('checkFavoriteQuote called with undefined quoteId');
        return false;
    }

    const userId = getUserId();
    const url = `/favorite-quotes/check?userId=${userId}&quoteId=${quoteId}`;
    logApiCall('GET', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for checking favorite quote');
        return checkFavoriteQuoteInLocalStorage(quoteId);
    }

    try {
        // Make a direct fetch call to ensure we're using the correct URL format
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        logApiResponse('GET', url, data);
        return data;
    } catch (error) {
        logApiError('GET', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for checking favorite quote');
        api.fallbackMode = true;
        return checkFavoriteQuoteInLocalStorage(quoteId);
    }
}

// ===== WEATHER MOODS API =====

// Get all weather moods
async function fetchWeatherMoods() {
    const url = '/weather-moods';
    logApiCall('GET', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for weather moods');
        return getWeatherMoodsFromLocalStorage();
    }

    try {
        const response = await api.get(url);
        logApiResponse('GET', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('GET', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for weather moods');
        api.fallbackMode = true;
        return getWeatherMoodsFromLocalStorage();
    }
}

// Get weather mood by weather condition
async function fetchWeatherMoodByWeather(weather) {
    const url = `/weather-moods/weather/${weather}`;
    logApiCall('GET', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for weather mood');
        return getWeatherMoodByWeatherFromLocalStorage(weather);
    }

    try {
        const response = await api.get(url);
        logApiResponse('GET', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('GET', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for weather mood');
        api.fallbackMode = true;
        return getWeatherMoodByWeatherFromLocalStorage(weather);
    }
}

// ===== MOOD TRACKER API =====

// Get all mood entries for the current user
async function fetchMoodEntries() {
    const userId = getUserId();
    const url = `/moods?userId=${userId}`;
    logApiCall('GET', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for mood entries');
        return getMoodEntriesFromLocalStorage();
    }

    try {
        const response = await api.get(url);
        logApiResponse('GET', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('GET', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for mood entries');
        api.fallbackMode = true;
        return getMoodEntriesFromLocalStorage();
    }
}

// Save a mood entry
async function saveMoodEntry(moodData) {
    const userId = getUserId();
    const url = '/moods';
    logApiCall('POST', url, moodData);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for saving mood entry');
        return saveMoodEntryToLocalStorage(moodData);
    }

    try {
        const moodEntry = {
            userId: userId,
            mood: moodData.mood,
            note: moodData.note,
            date: new Date().toISOString()
        };

        const response = await api.post(url, moodEntry);
        logApiResponse('POST', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('POST', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for saving mood entry');
        api.fallbackMode = true;
        return saveMoodEntryToLocalStorage(moodData);
    }
}

// ===== GRATITUDE JOURNAL API =====

// Get all gratitude entries for the current user
async function fetchGratitudeEntries() {
    const userId = getUserId();
    const url = `/gratitude?userId=${userId}`;
    logApiCall('GET', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for gratitude entries');
        return getGratitudeEntriesFromLocalStorage();
    }

    try {
        const response = await api.get(url);
        logApiResponse('GET', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('GET', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for gratitude entries');
        api.fallbackMode = true;
        return getGratitudeEntriesFromLocalStorage();
    }
}

// Save a gratitude entry
async function saveGratitudeEntry(entryData) {
    const userId = getUserId();
    const url = '/gratitude';
    logApiCall('POST', url, entryData);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for saving gratitude entry');
        return saveGratitudeEntryToLocalStorage(entryData);
    }

    try {
        const gratitudeEntry = {
            userId: userId,
            content: entryData.content,
            tags: entryData.tags,
            date: new Date().toISOString()
        };

        const response = await api.post(url, gratitudeEntry);
        logApiResponse('POST', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('POST', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for saving gratitude entry');
        api.fallbackMode = true;
        return saveGratitudeEntryToLocalStorage(entryData);
    }
}

// Update a gratitude entry
async function updateGratitudeEntry(id, entryData) {
    const url = `/gratitude/${id}`;
    logApiCall('PUT', url, entryData);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for updating gratitude entry');
        return updateGratitudeEntryInLocalStorage(id, entryData);
    }

    try {
        const response = await api.put(url, entryData);
        logApiResponse('PUT', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('PUT', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for updating gratitude entry');
        api.fallbackMode = true;
        return updateGratitudeEntryInLocalStorage(id, entryData);
    }
}

// Delete a gratitude entry
async function deleteGratitudeEntry(id) {
    const url = `/gratitude/${id}`;
    logApiCall('DELETE', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for deleting gratitude entry');
        return deleteGratitudeEntryFromLocalStorage(id);
    }

    try {
        const response = await api.delete(url);
        logApiResponse('DELETE', url, response.data);
        return true;
    } catch (error) {
        logApiError('DELETE', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for deleting gratitude entry');
        api.fallbackMode = true;
        return deleteGratitudeEntryFromLocalStorage(id);
    }
}

// Get gratitude stats for the current user
async function fetchGratitudeStats() {
    const userId = getUserId();
    const url = `/gratitude/stats?userId=${userId}`;
    logApiCall('GET', url);

    // Always use local calculation for stats to ensure consistency
    console.log('Using local calculation for gratitude stats');
    return calculateGratitudeStatsLocally();
}

// ===== FALLBACK METHODS (LOCALSTORAGE) =====

// Get quotes from localStorage
function getQuotesFromLocalStorage() {
    return fetch('data/quotes.json')
        .then(response => response.json())
        .catch(error => {
            console.error('Error loading quotes from file:', error);
            return [];
        });
}

// Get a random quote from localStorage
async function getRandomQuoteFromLocalStorage() {
    const quotes = await getQuotesFromLocalStorage();
    if (quotes.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}

// Get favorite quotes from localStorage
function getFavoriteQuotesFromLocalStorage() {
    return JSON.parse(localStorage.getItem('brightDaysFavoriteQuotes') || '[]');
}

// Add a quote to favorites in localStorage
function addFavoriteQuoteToLocalStorage(quote) {
    const favoriteQuotes = getFavoriteQuotesFromLocalStorage();

    // Check if already favorited
    const existingIndex = favoriteQuotes.findIndex(q =>
        q.text === quote.text && q.author === quote.author);

    if (existingIndex !== -1) {
        return favoriteQuotes[existingIndex];
    }

    // Add to favorites
    const newFavorite = {
        id: quote.id || Date.now().toString(),
        text: quote.text,
        author: quote.author,
        category: quote.category,
        dateAdded: new Date().toISOString()
    };

    favoriteQuotes.push(newFavorite);
    localStorage.setItem('brightDaysFavoriteQuotes', JSON.stringify(favoriteQuotes));

    return newFavorite;
}

// Remove a quote from favorites in localStorage
function removeFavoriteQuoteFromLocalStorage(quoteId) {
    const favoriteQuotes = getFavoriteQuotesFromLocalStorage();

    // Filter out the quote to remove
    const updatedFavorites = favoriteQuotes.filter(q => q.id !== quoteId);

    localStorage.setItem('brightDaysFavoriteQuotes', JSON.stringify(updatedFavorites));

    return true;
}

// Check if a quote is in favorites in localStorage
function checkFavoriteQuoteInLocalStorage(quoteId) {
    const favoriteQuotes = getFavoriteQuotesFromLocalStorage();
    return favoriteQuotes.some(q => q.id === quoteId);
}

// Get weather moods from localStorage
function getWeatherMoodsFromLocalStorage() {
    return fetch('data/weather_moods.json')
        .then(response => response.json())
        .catch(error => {
            console.error('Error loading weather moods from file:', error);
            return [];
        });
}

// Get weather mood by weather condition from localStorage
async function getWeatherMoodByWeatherFromLocalStorage(weather) {
    const weatherMoods = await getWeatherMoodsFromLocalStorage();

    // Normalize the weather string by removing day/night suffix
    const normalizedWeather = weather.replace('_day', '').replace('_night', '');

    // Try to find an exact match
    let weatherMood = weatherMoods.find(wm => wm.weather === normalizedWeather);

    // Try to find a match with spaces instead of underscores
    if (!weatherMood) {
        const formattedWeather = normalizedWeather.replace(/_/g, ' ');
        weatherMood = weatherMoods.find(wm => wm.weather === formattedWeather);
    }

    // Return default if no match found
    if (!weatherMood) {
        weatherMood = weatherMoods.find(wm => wm.weather === 'default');
    }

    return weatherMood || {
        weather: 'default',
        mood: 'Whatever the weather, today is a new opportunity to nurture your wellbeing and find moments of joy.',
        activities: [
            'Practice gratitude by listing three things you appreciate',
            'Take short mindfulness breaks throughout the day',
            'Connect with a friend or family member',
            'Move your body in a way that feels good',
            'Learn something new, however small'
        ]
    };
}

// Get mood entries from localStorage
function getMoodEntriesFromLocalStorage() {
    return JSON.parse(localStorage.getItem('brightDaysMoodData') || '[]');
}

// Save a mood entry to localStorage
function saveMoodEntryToLocalStorage(moodData) {
    const moodEntries = getMoodEntriesFromLocalStorage();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's already an entry for today
    const existingIndex = moodEntries.findIndex(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
    });

    const newEntry = {
        id: Date.now().toString(),
        mood: moodData.mood,
        note: moodData.note,
        date: new Date().toISOString()
    };

    if (existingIndex !== -1) {
        // Update existing entry
        moodEntries[existingIndex] = {
            ...moodEntries[existingIndex],
            ...newEntry
        };
    } else {
        // Add new entry
        moodEntries.push(newEntry);
    }

    localStorage.setItem('brightDaysMoodData', JSON.stringify(moodEntries));

    return newEntry;
}

// Get gratitude entries from localStorage
function getGratitudeEntriesFromLocalStorage() {
    return JSON.parse(localStorage.getItem('brightDaysGratitudeData') || '[]');
}

// Save a gratitude entry to localStorage
function saveGratitudeEntryToLocalStorage(entryData) {
    const gratitudeEntries = getGratitudeEntriesFromLocalStorage();

    const newEntry = {
        id: Date.now().toString(),
        content: entryData.content,
        tags: entryData.tags,
        date: new Date().toISOString()
    };

    gratitudeEntries.unshift(newEntry);
    localStorage.setItem('brightDaysGratitudeData', JSON.stringify(gratitudeEntries));

    return newEntry;
}

// Update a gratitude entry in localStorage
function updateGratitudeEntryInLocalStorage(id, entryData) {
    const gratitudeEntries = getGratitudeEntriesFromLocalStorage();

    const entryIndex = gratitudeEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) {
        throw new Error('Gratitude entry not found');
    }

    gratitudeEntries[entryIndex] = {
        ...gratitudeEntries[entryIndex],
        content: entryData.content,
        tags: entryData.tags
    };

    localStorage.setItem('brightDaysGratitudeData', JSON.stringify(gratitudeEntries));

    return gratitudeEntries[entryIndex];
}

// Delete a gratitude entry from localStorage
function deleteGratitudeEntryFromLocalStorage(id) {
    const gratitudeEntries = getGratitudeEntriesFromLocalStorage();

    const updatedEntries = gratitudeEntries.filter(entry => entry.id !== id);

    localStorage.setItem('brightDaysGratitudeData', JSON.stringify(updatedEntries));

    return true;
}

// Calculate gratitude stats locally
async function calculateGratitudeStatsLocally() {
    // First try to get entries from the backend
    try {
        const userId = getUserId();
        const url = `/gratitude?userId=${userId}`;
        const response = await api.get(url);
        const gratitudeEntries = response.data;
        return calculateStats(gratitudeEntries);
    } catch (error) {
        console.warn('Error fetching gratitude entries from backend, using localStorage');
        // Fallback to localStorage
        const gratitudeEntries = getGratitudeEntriesFromLocalStorage();
        return calculateStats(gratitudeEntries);
    }
}

// Helper function to calculate stats from entries
function calculateStats(gratitudeEntries) {
    // Total entries
    const totalEntries = gratitudeEntries.length;

    // Helper function to parse date from entry
    function parseEntryDate(entry) {
        if (Array.isArray(entry.date)) {
            // Handle MongoDB date array format [year, month, day, hour, minute, second, millisecond]
            const [year, month, day, hour, minute, second] = entry.date;
            // Note: MongoDB months are 1-based, JavaScript months are 0-based
            return new Date(year, month - 1, day, hour, minute, second);
        } else {
            // Handle ISO string date format
            return new Date(entry.date);
        }
    }

    // Monthly entries
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEntries = gratitudeEntries.filter(entry => {
        const entryDate = parseEntryDate(entry);
        return !isNaN(entryDate.getTime()) && entryDate >= firstDayOfMonth;
    }).length;

    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's an entry today
    const hasEntryToday = gratitudeEntries.some(entry => {
        const entryDate = parseEntryDate(entry);
        if (isNaN(entryDate.getTime())) return false;

        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
    });

    if (!hasEntryToday) {
        // Check if there was an entry yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const hasEntryYesterday = gratitudeEntries.some(entry => {
            const entryDate = parseEntryDate(entry);
            if (isNaN(entryDate.getTime())) return false;

            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === yesterday.getTime();
        });

        if (!hasEntryYesterday) {
            return { totalEntries, currentStreak: 0, monthlyEntries };
        }
    }

    // Get unique dates (one entry per day)
    const uniqueDates = [];
    gratitudeEntries.forEach(entry => {
        const entryDate = parseEntryDate(entry);
        if (isNaN(entryDate.getTime())) return;

        entryDate.setHours(0, 0, 0, 0);

        if (!uniqueDates.some(date => date.getTime() === entryDate.getTime())) {
            uniqueDates.push(entryDate);
        }
    });

    // Sort dates in descending order
    uniqueDates.sort((a, b) => b - a);

    // Calculate streak
    let currentDate = hasEntryToday ? today : new Date(today);
    if (!hasEntryToday) {
        currentDate.setDate(currentDate.getDate() - 1);
    }

    for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date(currentDate);

        if (uniqueDates[i].getTime() === expectedDate.getTime()) {
            currentStreak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return { totalEntries, currentStreak, monthlyEntries };
}

// Export all API functions
export {
    fetchQuotes,
    fetchRandomQuote,
    fetchFavoriteQuotes,
    addFavoriteQuote,
    removeFavoriteQuote,
    checkFavoriteQuote,
    fetchWeatherMoods,
    fetchWeatherMoodByWeather,
    fetchMoodEntries,
    saveMoodEntry,
    fetchGratitudeEntries,
    saveGratitudeEntry,
    updateGratitudeEntry,
    deleteGratitudeEntry,
    fetchGratitudeStats
};
