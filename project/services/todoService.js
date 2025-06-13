/**
 * Todo service for handling todo-related API calls
 * This file contains methods for todo CRUD operations
 */

// Use the api instance from api.js
// For direct browser usage, make sure api.js is included before this file

const todoService = {
    /**
     * Create a new todo item
     * @param {string} userId - User ID
     * @param {Object} todoData - Todo data including text, completed status, tags, priority, etc.
     * @returns {Promise} - Promise with the created todo data
     */
    createTodo: async (userId, todoData) => {
        try {
            // Check if we're in fallback mode first to avoid unnecessary API calls
            if (api.isInFallbackMode()) {
                console.log('Creating todo in fallback mode');
                // Create a mock todo with an ID
                const mockTodo = {
                    ...todoData,
                    _id: 'local-' + Date.now(),
                    userId: userId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                // Store in localStorage for fallback mode
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                todos.push(mockTodo);
                localStorage.setItem('todos', JSON.stringify(todos));
                
                return mockTodo;
            }
            
            // Only try to make the API call if we're not in fallback mode
            const response = await api.post('/todos', todoData);
            return response.data;
        } catch (error) {
            // If the error is from fallback mode, handle it gracefully
            if (error.fallbackMode) {
                console.log('Handling fallback mode error for createTodo');
                // Create a mock todo with an ID
                const mockTodo = {
                    ...todoData,
                    _id: 'local-' + Date.now(),
                    userId: userId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                // Store in localStorage for fallback mode
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                todos.push(mockTodo);
                localStorage.setItem('todos', JSON.stringify(todos));
                
                return mockTodo;
            }
            
            console.error('Error creating todo:', error);
            throw error;
        }
    },

    /**
     * Get all todos for a user
     * @param {string} userId - User ID
     * @returns {Promise} - Promise with array of todos
     */
    getTodosByUserId: async (userId) => {
        try {
            // Check if we're in fallback mode first to avoid unnecessary API calls
            if (api.isInFallbackMode()) {
                console.log('Getting todos for user in fallback mode:', userId);
                // Get todos from localStorage
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                // Filter by userId if provided
                if (userId) {
                    todos = todos.filter(todo => todo.userId === userId);
                }
                return todos;
            }
            
            // The backend extracts userId from the token
            const response = await api.get('/todos');
            return response.data;
        } catch (error) {
            // If the error is from fallback mode or a network error, try to get from localStorage
            if (error.fallbackMode || error.request) {
                console.log('Handling fallback for getTodosByUserId:', userId);
                // Get todos from localStorage
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                // Filter by userId if provided
                if (userId) {
                    todos = todos.filter(todo => todo.userId === userId);
                }
                return todos;
            }
            
            console.error(`Error getting todos for user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Get todo by ID
     * @param {string} userId - User ID
     * @param {string} todoId - Todo ID
     * @returns {Promise} - Promise with the todo data
     */
    getTodoById: async (userId, todoId) => {
        try {
            // Check if todoId is undefined or null
            if (!todoId) {
                console.error('getTodoById called with undefined todoId');
                throw new Error('Todo ID is required');
            }
            
            // Check if we're in fallback mode first to avoid unnecessary API calls
            if (api.isInFallbackMode()) {
                console.log('Getting todo by ID in fallback mode:', todoId);
                // Get the todo from localStorage
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                const todo = todos.find(todo => (todo.id || todo._id) === todoId);
                
                if (todo) {
                    return todo;
                } else {
                    throw new Error('Todo not found in local storage');
                }
            }
            
            // Only try to make the API call if we're not in fallback mode
            const response = await api.get(`/todos/${todoId}`);
            return response.data;
        } catch (error) {
            // If the error is from fallback mode or a network error, try to get from localStorage
            if (error.fallbackMode || error.request) {
                console.log('Handling fallback for getTodoById:', todoId);
                // Get the todo from localStorage
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                const todo = todos.find(todo => (todo.id || todo._id) === todoId);
                
                if (todo) {
                    return todo;
                } else {
                    throw new Error('Todo not found in local storage');
                }
            }
            
            console.error(`Error getting todo with ID ${todoId}:`, error);
            throw error;
        }
    },

    /**
     * Update todo
     * @param {string} userId - User ID
     * @param {string} todoId - Todo ID
     * @param {Object} todoData - Updated todo data
     * @returns {Promise} - Promise with the updated todo data
     */
    updateTodo: async (userId, todoId, todoData) => {
        try {
            // Check if todoId is undefined or null
            if (!todoId) {
                console.error('updateTodo called with undefined todoId');
                throw new Error('Todo ID is required');
            }
            
            // Check if we're in fallback mode first to avoid unnecessary API calls
            if (api.isInFallbackMode()) {
                console.log('Updating todo in fallback mode:', todoId);
                // Update the todo in localStorage
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                const todoIndex = todos.findIndex(todo => (todo.id || todo._id) === todoId);
                
                if (todoIndex > -1) {
                    // Update the todo
                    todos[todoIndex] = {
                        ...todos[todoIndex],
                        ...todoData,
                        updatedAt: new Date().toISOString()
                    };
                    localStorage.setItem('todos', JSON.stringify(todos));
                    return todos[todoIndex];
                } else {
                    throw new Error('Todo not found in local storage');
                }
            }
            
            // Only try to make the API call if we're not in fallback mode
            const response = await api.put(`/todos/${todoId}`, todoData);
            return response.data;
        } catch (error) {
            // If the error is from fallback mode, handle it gracefully
            if (error.fallbackMode) {
                console.log('Handling fallback mode error for updateTodo:', todoId);
                // Update the todo in localStorage
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                const todoIndex = todos.findIndex(todo => (todo.id || todo._id) === todoId);
                
                if (todoIndex > -1) {
                    // Update the todo
                    todos[todoIndex] = {
                        ...todos[todoIndex],
                        ...todoData,
                        updatedAt: new Date().toISOString()
                    };
                    localStorage.setItem('todos', JSON.stringify(todos));
                    return todos[todoIndex];
                } else {
                    throw new Error('Todo not found in local storage');
                }
            }
            
            console.error(`Error updating todo with ID ${todoId}:`, error);
            throw error;
        }
    },

    /**
     * Toggle todo completion status
     * @param {string} userId - User ID
     * @param {string} todoId - Todo ID
     * @returns {Promise} - Promise with the updated todo data
     */
    toggleTodoCompleted: async (userId, todoId) => {
        try {
            // Check if we're in fallback mode first to avoid unnecessary API calls
            if (api.isInFallbackMode()) {
                console.log('Toggling todo completion in fallback mode:', todoId);
                // Get the todo from localStorage
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                const todoIndex = todos.findIndex(todo => (todo.id || todo._id) === todoId);
                
                if (todoIndex > -1) {
                    // Toggle the completed status
                    todos[todoIndex].completed = !todos[todoIndex].completed;
                    todos[todoIndex].updatedAt = new Date().toISOString();
                    localStorage.setItem('todos', JSON.stringify(todos));
                    return todos[todoIndex];
                } else {
                    throw new Error('Todo not found in local storage');
                }
            }
            
            // If not in fallback mode, use the regular flow
            const todo = await todoService.getTodoById(userId, todoId);
            return await todoService.updateTodo(userId, todoId, {
                ...todo,
                completed: !todo.completed
            });
        } catch (error) {
            // If the error is from fallback mode, handle it gracefully
            if (error.fallbackMode) {
                console.log('Handling fallback mode error for toggleTodoCompleted:', todoId);
                // Get the todo from localStorage
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                const todoIndex = todos.findIndex(todo => (todo.id || todo._id) === todoId);
                
                if (todoIndex > -1) {
                    // Toggle the completed status
                    todos[todoIndex].completed = !todos[todoIndex].completed;
                    todos[todoIndex].updatedAt = new Date().toISOString();
                    localStorage.setItem('todos', JSON.stringify(todos));
                    return todos[todoIndex];
                } else {
                    throw new Error('Todo not found in local storage');
                }
            }
            
            console.error(`Error toggling todo with ID ${todoId}:`, error);
            throw error;
        }
    },

    /**
     * Delete todo
     * @param {string} userId - User ID
     * @param {string} todoId - Todo ID
     * @returns {Promise} - Promise with no content
     */
    deleteTodo: async (userId, todoId) => {
        try {
            // Check if we're in fallback mode first to avoid unnecessary API calls
            if (api.isInFallbackMode()) {
                console.log('Deleting todo in fallback mode:', todoId);
                // Delete the todo from localStorage
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                const filteredTodos = todos.filter(todo => (todo.id || todo._id) !== todoId);
                localStorage.setItem('todos', JSON.stringify(filteredTodos));
                return true;
            }
            
            // Only try to make the API call if we're not in fallback mode
            await api.delete(`/todos/${todoId}`);
            return true;
        } catch (error) {
            // If the error is from fallback mode, handle it gracefully
            if (error.fallbackMode) {
                console.log('Handling fallback mode error for deleteTodo:', todoId);
                // Delete the todo from localStorage
                let todos = JSON.parse(localStorage.getItem('todos') || '[]');
                const filteredTodos = todos.filter(todo => (todo.id || todo._id) !== todoId);
                localStorage.setItem('todos', JSON.stringify(filteredTodos));
                return true;
            }
            
            console.error(`Error deleting todo with ID ${todoId}:`, error);
            throw error;
        }
    },
    
    /**
     * Get todos by tag
     * @param {string} userId - User ID
     * @param {string} tag - Tag to filter by
     * @returns {Promise} - Promise with array of todos
     */
    getTodosByTag: async (userId, tag) => {
        try {
            const allTodos = await todoService.getTodosByUserId(userId);
            return allTodos.filter(todo => 
                (todo.tags && todo.tags.includes(tag)) || todo.tag === tag
            );
        } catch (error) {
            console.error(`Error getting todos with tag ${tag}:`, error);
            throw error;
        }
    },
    
    /**
     * Get todos by priority
     * @param {string} userId - User ID
     * @param {number} priority - Priority level (1-3)
     * @returns {Promise} - Promise with array of todos
     */
    getTodosByPriority: async (userId, priority) => {
        try {
            const allTodos = await todoService.getTodosByUserId(userId);
            return allTodos.filter(todo => todo.priority === priority);
        } catch (error) {
            console.error(`Error getting todos with priority ${priority}:`, error);
            throw error;
        }
    },
    
    /**
     * Get completed todos
     * @param {string} userId - User ID
     * @returns {Promise} - Promise with array of completed todos
     */
    getCompletedTodos: async (userId) => {
        try {
            const allTodos = await todoService.getTodosByUserId(userId);
            return allTodos.filter(todo => todo.completed);
        } catch (error) {
            console.error('Error getting completed todos:', error);
            throw error;
        }
    },
    
    /**
     * Get active (not completed) todos
     * @param {string} userId - User ID
     * @returns {Promise} - Promise with array of active todos
     */
    getActiveTodos: async (userId) => {
        try {
            const allTodos = await todoService.getTodosByUserId(userId);
            return allTodos.filter(todo => !todo.completed);
        } catch (error) {
            console.error('Error getting active todos:', error);
            throw error;
        }
    }
};

// Make the service available globally for direct browser usage
window.todoService = todoService;