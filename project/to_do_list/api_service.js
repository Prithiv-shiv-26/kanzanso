// Fixed API Service for Todo Items using axios
// This service uses the axios instance from api.js for consistency

// Log API calls for debugging
function logApiCall(method, url, data = null) {
    console.log(`[API] ${method} ${url}`, data ? data : '');
}

// Log API responses for debugging
function logApiResponse(method, url, response) {
    console.log(`[API] Response from ${method} ${url}:`, response);
}

// Log API errors for debugging
function logApiError(method, url, error) {
    console.error(`[API] Error from ${method} ${url}:`, error);
}

// Check if MongoDB is running
async function checkMongoDBConnection() {
    try {
        console.log('Checking MongoDB connection...');

        // Use a direct fetch to the backend URL to avoid CORS issues
        const response = await fetch('http://localhost:8080/api/test', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('API test response:', response);

        if (response.ok) {
            console.log('Backend API is reachable');
            return true;
        } else {
            console.warn('Backend API returned an error:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error connecting to backend API:', error);
        console.error('Error details:', error);
        return false;
    }
}

// Force fallback mode for testing
const FORCE_FALLBACK = false;

// Check if we should use fallback mode
async function shouldUseFallback() {
    if (FORCE_FALLBACK) {
        console.log('Forcing fallback mode for testing');
        return true;
    }

    // Check if api.fallbackMode is already set
    if (api.fallbackMode) {
        console.log('Using fallback mode (already set)');
        return true;
    }

    // Check if MongoDB is running
    const isMongoDBRunning = await checkMongoDBConnection();
    if (!isMongoDBRunning) {
        console.log('MongoDB is not running, using fallback mode');
        api.fallbackMode = true;
        return true;
    }

    return false;
}

// Get all todos for the current user
async function fetchTodos() {
    const url = '/todos';
    logApiCall('GET', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for todos');
        return getTodosFromLocalStorage();
    }

    try {
        console.log('Fetching todos from API...');
        console.log('API base URL:', api.defaults.baseURL);
        console.log('Full URL:', api.defaults.baseURL + url);

        const response = await api.get(url);
        logApiResponse('GET', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('GET', url, error);
        console.error('Error details:', error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for todos');
        api.fallbackMode = true;
        return getTodosFromLocalStorage();
    }
}

// Create a new todo
async function createTodo(todoData) {
    const url = '/todos';
    logApiCall('POST', url, todoData);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for creating todo');
        return saveToLocalStorageAndReturn(todoData);
    }

    try {
        // Ensure todoData has all required fields
        const validatedTodoData = validateTodoData(todoData);

        console.log('Creating todo with data:', validatedTodoData);
        console.log('API base URL:', api.defaults.baseURL);
        console.log('Full URL:', api.defaults.baseURL + url);

        const response = await api.post(url, validatedTodoData);
        logApiResponse('POST', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('POST', url, error);
        console.error('Error details:', error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for creating todo');
        api.fallbackMode = true;
        return saveToLocalStorageAndReturn(todoData);
    }
}

// Update an existing todo
async function updateTodo(id, todoData) {
    const url = `/todos/${id}`;
    logApiCall('PUT', url, todoData);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for updating todo');
        return updateInLocalStorageAndReturn(id, todoData);
    }

    try {
        // Ensure todoData has all required fields
        const validatedTodoData = validateTodoData(todoData);

        const response = await api.put(url, validatedTodoData);
        logApiResponse('PUT', url, response.data);
        return response.data;
    } catch (error) {
        logApiError('PUT', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for updating todo');
        api.fallbackMode = true;
        return updateInLocalStorageAndReturn(id, todoData);
    }
}

// Delete a todo
async function deleteTodoItem(id) {
    const url = `/todos/${id}`;
    logApiCall('DELETE', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for deleting todo');
        return deleteFromLocalStorage(id);
    }

    try {
        const response = await api.delete(url);
        logApiResponse('DELETE', url, response.data);
        return true;
    } catch (error) {
        logApiError('DELETE', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for deleting todo');
        api.fallbackMode = true;
        return deleteFromLocalStorage(id);
    }
}

// Toggle todo completion status
async function toggleTodoComplete(id, completed) {
    const url = `/todos/${id}`;
    logApiCall('GET', url);

    // Check if we should use fallback mode
    const useFallback = await shouldUseFallback();
    if (useFallback) {
        console.warn('Using fallback mode for toggling todo completion');
        return toggleCompleteInLocalStorage(id);
    }

    try {
        // First get the current todo
        const response = await api.get(url);
        const todo = response.data;
        logApiResponse('GET', url, todo);

        // Update the completed status
        todo.completed = completed;

        // Save the updated todo
        return await updateTodo(id, todo);
    } catch (error) {
        logApiError('GET', url, error);

        // If API call fails, switch to fallback mode
        console.warn('API call failed, falling back to localStorage for toggling todo completion');
        api.fallbackMode = true;
        return toggleCompleteInLocalStorage(id);
    }
}

// Helper function to validate and normalize todo data
function validateTodoData(todoData) {
    // Create a copy of the data to avoid modifying the original
    const validatedData = { ...todoData };

    // Ensure text field exists and is a string
    if (!validatedData.text) {
        validatedData.text = "Untitled Task";
    }

    // Ensure tags is an array
    if (!validatedData.tags || !Array.isArray(validatedData.tags)) {
        validatedData.tags = [];
    }

    // Ensure priority is a number between 1 and 3
    if (!validatedData.priority || validatedData.priority < 1 || validatedData.priority > 3) {
        validatedData.priority = 1; // Default to low priority
    }

    // Ensure notes is a string
    if (!validatedData.notes) {
        validatedData.notes = "";
    }

    // Ensure completed is a boolean
    if (validatedData.completed === undefined) {
        validatedData.completed = false;
    }

    return validatedData;
}

// Helper functions for localStorage fallback
function getTodosFromLocalStorage() {
    let todos;
    if (localStorage.getItem('todos') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    return todos;
}

function saveToLocalStorageAndReturn(todoData) {
    let todos = getTodosFromLocalStorage();
    const newTodo = {
        ...validateTodoData(todoData),
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    todos.push(newTodo);
    localStorage.setItem('todos', JSON.stringify(todos));
    return newTodo;
}

function updateInLocalStorageAndReturn(id, todoData) {
    let todos = getTodosFromLocalStorage();
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
        const validatedData = validateTodoData(todoData);
        todos[todoIndex] = {
            ...todos[todoIndex],
            ...validatedData,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('todos', JSON.stringify(todos));
        return todos[todoIndex];
    }
    return null;
}

function deleteFromLocalStorage(id) {
    let todos = getTodosFromLocalStorage();
    todos = todos.filter(todo => todo.id !== id);
    localStorage.setItem('todos', JSON.stringify(todos));
    return true;
}

function toggleCompleteInLocalStorage(id) {
    let todos = getTodosFromLocalStorage();
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        todos[todoIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('todos', JSON.stringify(todos));
        return todos[todoIndex];
    }
    return null;
}
