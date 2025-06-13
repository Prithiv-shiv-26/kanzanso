// API Service for Todo Items
const API_BASE_URL = 'http://localhost:8080/api';

// Get the authentication token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// Get all todos for the current user
async function fetchTodos() {
    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching todos: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching todos:', error);
        // Fall back to localStorage if API call fails
        return getTodosFromLocalStorage();
    }
}

// Create a new todo
async function createTodo(todoData) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(todoData)
        });
        
        if (!response.ok) {
            throw new Error(`Error creating todo: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating todo:', error);
        // Fall back to localStorage if API call fails
        return saveToLocalStorageAndReturn(todoData);
    }
}

// Update an existing todo
async function updateTodo(id, todoData) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(todoData)
        });
        
        if (!response.ok) {
            throw new Error(`Error updating todo: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating todo:', error);
        // Fall back to localStorage if API call fails
        return updateInLocalStorageAndReturn(id, todoData);
    }
}

// Delete a todo
async function deleteTodoItem(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error deleting todo: ${response.statusText}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting todo:', error);
        // Fall back to localStorage if API call fails
        return deleteFromLocalStorage(id);
    }
}

// Toggle todo completion status
async function toggleTodoComplete(id, completed) {
    try {
        // First get the current todo
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching todo: ${response.statusText}`);
        }
        
        const todo = await response.json();
        
        // Update the completed status
        todo.completed = completed;
        
        // Save the updated todo
        return await updateTodo(id, todo);
    } catch (error) {
        console.error('Error toggling todo completion:', error);
        // Fall back to localStorage if API call fails
        return toggleCompleteInLocalStorage(id);
    }
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
        ...todoData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
    };
    todos.push(newTodo);
    localStorage.setItem('todos', JSON.stringify(todos));
    return newTodo;
}

function updateInLocalStorageAndReturn(id, todoData) {
    let todos = getTodosFromLocalStorage();
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
        todos[todoIndex] = { ...todos[todoIndex], ...todoData, updatedAt: new Date().toISOString() };
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
        localStorage.setItem('todos', JSON.stringify(todos));
        return todos[todoIndex];
    }
    return null;
}
