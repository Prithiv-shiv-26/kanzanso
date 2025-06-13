// Selectors
const todoForm = document.getElementById('todo-form');
const todoInput = document.querySelector('.todo-input');
const todoDate = document.querySelector('.todo-date');
const todoTime = document.querySelector('.todo-time');
const todoTag = document.getElementById('todo-tag');
const todoPriority = document.getElementById('todo-priority');
const todoGridContainer = document.querySelector('.todo-grid-container');
const filterTag = document.getElementById('filter-tag');
const filterPriority = document.getElementById('filter-priority');
const filterStatus = document.getElementById('filter-status');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editId = document.getElementById('edit-id');
const editText = document.getElementById('edit-text');
const editDate = document.getElementById('edit-date');
const editTime = document.getElementById('edit-time');
const editTag = document.getElementById('edit-tag');
const editPriority = document.getElementById('edit-priority');
const editNotes = document.getElementById('edit-notes');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.querySelector('.cancel-btn');
const standardTheme = document.querySelector('.standard-theme');
const lightTheme = document.querySelector('.light-theme');

// Event Listeners
document.addEventListener('DOMContentLoaded', getTodos);
todoForm.addEventListener('submit', addTodo);
todoGridContainer.addEventListener('click', handleTodoClick);
filterTag.addEventListener('change', filterTodos);
filterPriority.addEventListener('change', filterTodos);
filterStatus.addEventListener('change', filterTodos);
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
editForm.addEventListener('submit', saveEditedTodo);
standardTheme.addEventListener('click', () => changeTheme('standard'));
lightTheme.addEventListener('click', () => changeTheme('light'));

// Check for saved theme
let savedTheme = localStorage.getItem('savedTheme');
if (savedTheme) {
    changeTheme(localStorage.getItem('savedTheme'));
}

// Use the API object from api.js

// Function to get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// Check if user is logged in
if (!getAuthToken()) {
    // Redirect to login page if not logged in
    window.location.href = '../login/login.html';
}

// Functions
async function addTodo(event) {
    event.preventDefault();

    // Disable the submit button to prevent double submission
    const submitButton = todoForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';
        submitButton.style.cursor = 'not-allowed';
    }

    // Validate input
    if (todoInput.value.trim() === '') {
        showErrorMessage('Please enter a task');
        // Re-enable the submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
        }
        return;
    }

    // Log the date and time values for debugging
    console.log('Todo date value:', todoDate.value);
    console.log('Todo time value:', todoTime.value);

    // Create todo object with properly formatted dueDate
    let dueDate = null;
    if (todoDate.value) {
        try {
            // Combine date and time into a single Date object
            const dateTimeStr = todoDate.value + (todoTime.value ? 'T' + todoTime.value : 'T00:00:00');
            dueDate = new Date(dateTimeStr);

            // Validate the date
            if (isNaN(dueDate.getTime())) {
                console.error('Invalid date/time combination:', dateTimeStr);
                dueDate = null;
            } else {
                console.log('Valid dueDate created:', dueDate);
                // Convert to ISO string for the API
                dueDate = dueDate.toISOString();
            }
        } catch (error) {
            console.error('Error creating dueDate:', error);
            dueDate = null;
        }
    }

    const todoData = {
        text: todoInput.value.trim(),
        completed: false,
        dueDate: dueDate,
        tags: todoTag.value ? [todoTag.value] : [],
        priority: parseInt(todoPriority.value) || 1,
        notes: ''
    };

    console.log('Sending todo data to API:', todoData);

    try {
        // Show loading indicator
        showLoadingMessage('Adding todo...');

        // Call API to create todo
        console.log('Creating todo with data:', todoData);
        await api.post('/todos', todoData);

        // Hide loading indicator
        hideLoadingMessage();

        // Show success message
        showSuccessMessage('Todo added successfully');

        // Render the new todo
        renderTodos();

        // Clear form
        todoForm.reset();
    } catch (error) {
        // Hide loading indicator
        hideLoadingMessage();

        console.error('Error adding todo:', error);
        showErrorMessage('Failed to add todo: ' + (error.message || 'Please try again'));
    } finally {
        // Re-enable the submit button
        if (submitButton) {
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
                submitButton.style.cursor = 'pointer';
            }, 500); // Small delay to prevent accidental double clicks
        }
    }
}

async function getTodos() {
    try {
        // Clear the container
        todoGridContainer.innerHTML = '';

        // Show loading indicator
        todoGridContainer.innerHTML = '<div class="loading">Loading...</div>';

        // Get todos from API
        console.log('Fetching todos from API...');
        const response = await api.get('/todos');
        console.log('API response:', response);
        const todos = response.data;

        // Render todos
        renderTodos(todos);
    } catch (error) {
        console.error('Error getting todos:', error);
        showErrorMessage('Failed to load todos: ' + (error.message || 'Please try again'));

        // Clear loading indicator
        todoGridContainer.innerHTML = '<div class="error">Failed to load todos</div>';
    }
}

function renderTodos(todos = null) {
    // Clear the container
    todoGridContainer.innerHTML = '';

    if (!todos) {
        // If no todos provided, fetch them
        getTodos();
        return;
    }

    // Filter todos based on current filter settings
    const filteredTodos = filterTodosList(todos);

    // Check if there are any todos
    if (filteredTodos.length === 0) {
        todoGridContainer.innerHTML = '<div class="empty-state">No tasks found</div>';
        return;
    }

    // Render each todo
    filteredTodos.forEach(todo => {
        const todoCard = createTodoCard(todo);
        todoGridContainer.appendChild(todoCard);
    });
}

function createTodoCard(todo) {
    // Create card container
    const todoCard = document.createElement('div');
    todoCard.classList.add('todo-card');
    todoCard.dataset.id = todo.id;

    // Add completed class if todo is completed
    if (todo.completed) {
        todoCard.classList.add('completed');
    }

    // Add priority class
    todoCard.classList.add(`priority-${todo.priority}`);

    // Create card content
    // Log the dueDate for debugging
    console.log('Todo dueDate before parsing:', todo.dueDate);

    // Parse the dueDate - handle both ISO string format and array format
    let dueDate = null;
    if (todo.dueDate) {
        try {
            // Try to parse as a date
            dueDate = new Date(todo.dueDate);

            // Check if the date is valid
            if (isNaN(dueDate.getTime())) {
                console.error('Invalid date format:', todo.dueDate);
                dueDate = null;
            } else {
                console.log('Successfully parsed dueDate:', dueDate);
            }
        } catch (error) {
            console.error('Error parsing dueDate:', error);
            dueDate = null;
        }
    }

    // Format the date and time if we have a valid date
    const formattedDate = dueDate ? dueDate.toLocaleDateString() : '';
    const formattedTime = dueDate ? dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    console.log('Formatted date and time:', formattedDate, formattedTime);

    // Format tags with proper styling
    let tagsHtml = '';
    if (todo.tags && todo.tags.length > 0) {
        tagsHtml = todo.tags.map(tag => `<span class="todo-tag ${tag}">${tag}</span>`).join('');
    }

    todoCard.innerHTML = `
        <div class="todo-content">
            <h3 class="todo-text">${todo.text}</h3>
            ${dueDate ? `<p class="todo-date-time"><i class="fas fa-calendar-alt"></i> <strong>Due:</strong> ${formattedDate} ${formattedTime}</p>` : ''}
            <div class="todo-tags">${tagsHtml}</div>
            <p class="todo-priority"><i class="fas fa-flag"></i> Priority: ${['Low', 'Medium', 'High'][todo.priority - 1]}</p>
            ${todo.notes ? `<p class="todo-notes"><i class="fas fa-sticky-note"></i> ${todo.notes}</p>` : ''}
        </div>
        <div class="todo-actions">
            <button class="complete-btn ${todo.completed ? 'completed' : ''}" title="Mark as ${todo.completed ? 'incomplete' : 'complete'}">
                <i class="fas fa-check"></i>
            </button>
            <button class="edit-btn" title="Edit task">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return todoCard;
}

async function handleTodoClick(event) {
    const item = event.target;
    const todoCard = item.closest('.todo-card');

    if (!todoCard) return;

    const todoId = todoCard.dataset.id;

    // Check which button was clicked
    if (item.closest('.complete-btn')) {
        toggleComplete(todoId);
    } else if (item.closest('.delete-btn')) {
        deleteTodo(todoId);
    } else if (item.closest('.edit-btn')) {
        // Get todo data from the card
        const todoText = todoCard.querySelector('.todo-text').textContent;
        const todoDateTimeText = todoCard.querySelector('.todo-date-time')?.textContent || '';
        const todoTagText = todoCard.querySelector('.todo-tag')?.textContent || '';
        const todoPriorityText = todoCard.querySelector('.todo-priority').textContent;

        console.log('Todo date-time text from card:', todoDateTimeText);

        // Parse date and time - handle the "Due:" prefix if present
        let todoDateTime = todoDateTimeText.replace('Due:', '').trim().split(' ');
        let todoDateValue = '';
        let todoTimeValue = '';

        // Show loading indicator
        showLoadingMessage('Loading todo details...');

        // Get the full todo object from the API
        try {
            const response = await api.get(`/todos/${todoId}`);
            const todo = response.data;

            console.log('Todo from API:', todo);
            console.log('Todo dueDate from API:', todo.dueDate);

            // Hide loading indicator
            hideLoadingMessage();

            // Parse the dueDate from the API response
            if (todo.dueDate) {
                try {
                    const dueDate = new Date(todo.dueDate);

                    if (!isNaN(dueDate.getTime())) {
                        // Format date as YYYY-MM-DD for the date input
                        todoDateValue = dueDate.toISOString().split('T')[0];

                        // Format time as HH:MM for the time input
                        const hours = dueDate.getHours().toString().padStart(2, '0');
                        const minutes = dueDate.getMinutes().toString().padStart(2, '0');
                        todoTimeValue = `${hours}:${minutes}`;

                        console.log('Parsed date and time from API:', todoDateValue, todoTimeValue);
                    } else {
                        console.error('Invalid date from API:', todo.dueDate);
                    }
                } catch (error) {
                    console.error('Error parsing date from API:', error);
                }
            }

            // Parse priority
            let todoPriorityValue = todo.priority || 1;
            if (todoPriorityValue < 1 || todoPriorityValue > 3) {
                // Fallback to parsing from the text if the API value is invalid
                if (todoPriorityText.includes('Medium')) {
                    todoPriorityValue = 2;
                } else if (todoPriorityText.includes('High')) {
                    todoPriorityValue = 3;
                } else {
                    todoPriorityValue = 1;
                }
            }

            // Open edit modal with todo data
            openEditModal({
                id: todoId,
                text: todoText,
                date: todoDateValue,
                time: todoTimeValue,
                tag: todo.tags && todo.tags.length > 0 ? todo.tags[0] : '',
                priority: todoPriorityValue,
                notes: todo.notes || ''
            });
        } catch (error) {
            // Hide loading indicator
            hideLoadingMessage();

            console.error('Error getting todo details:', error);
            showErrorMessage('Failed to get todo details: ' + (error.message || 'Please try again'));

            // Fallback to parsing from the card if we can't get the data from the API
            if (todoDateTime.length >= 1) {
                const dateParts = todoDateTime[0].split('/');
                if (dateParts.length === 3) {
                    todoDateValue = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
                }
            }

            if (todoDateTime.length >= 2) {
                // Try to convert the time to 24-hour format for the time input
                try {
                    const timeParts = todoDateTime[1].match(/(\d+):(\d+)(?::(\d+))?\s*([AP]M)?/i);
                    if (timeParts) {
                        let hours = parseInt(timeParts[1]);
                        const minutes = parseInt(timeParts[2]);
                        const ampm = timeParts[4] ? timeParts[4].toUpperCase() : null;

                        if (ampm === 'PM' && hours < 12) hours += 12;
                        if (ampm === 'AM' && hours === 12) hours = 0;

                        todoTimeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    } else {
                        todoTimeValue = todoDateTime[1];
                    }
                } catch (e) {
                    console.error('Error parsing time:', e);
                    todoTimeValue = todoDateTime[1];
                }
            }

            // Parse priority
            let todoPriorityValue = 1;
            if (todoPriorityText.includes('Medium')) {
                todoPriorityValue = 2;
            } else if (todoPriorityText.includes('High')) {
                todoPriorityValue = 3;
            }

            // Fallback to using the data from the card
            openEditModal({
                id: todoId,
                text: todoText,
                date: todoDateValue,
                time: todoTimeValue,
                tag: todoTagText,
                priority: todoPriorityValue,
                notes: ''
            });
        }
    }
}

async function toggleComplete(id) {
    try {
        const todoCard = document.querySelector(`.todo-card[data-id="${id}"]`);
        const isCompleted = todoCard.classList.contains('completed');

        // Toggle completed status in UI
        todoCard.classList.toggle('completed');
        todoCard.querySelector('.complete-btn').classList.toggle('completed');

        // Show loading indicator
        showLoadingMessage('Updating todo status...');

        // First get the current todo from the API
        const response = await api.get(`/todos/${id}`);
        const todo = response.data;

        // Update only the completed status
        todo.completed = !isCompleted;

        // Send the complete todo object back to the API
        await api.put(`/todos/${id}`, todo);

        // Hide loading indicator
        hideLoadingMessage();

        // Show success message
        showSuccessMessage('Todo status updated');
    } catch (error) {
        // Hide loading indicator
        hideLoadingMessage();

        console.error('Error toggling todo completion:', error);
        showErrorMessage('Failed to update todo status: ' + (error.message || 'Please try again'));

        // Revert UI change
        const todoCard = document.querySelector(`.todo-card[data-id="${id}"]`);
        todoCard.classList.toggle('completed');
        todoCard.querySelector('.complete-btn').classList.toggle('completed');
    }
}

async function deleteTodo(id) {
    try {
        // Show confirmation dialog
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        // Remove from UI
        const todoCard = document.querySelector(`.todo-card[data-id="${id}"]`);
        todoCard.classList.add('fall');

        // Show loading indicator
        showLoadingMessage('Deleting todo...');

        // Wait for animation to complete
        todoCard.addEventListener('transitionend', async function() {
            try {
                // Delete from API
                await api.delete(`/todos/${id}`);

                // Hide loading indicator
                hideLoadingMessage();

                // Show success message
                showSuccessMessage('Todo deleted successfully');

                todoCard.remove();
            } catch (error) {
                // Hide loading indicator
                hideLoadingMessage();

                console.error('Error deleting todo:', error);
                showErrorMessage('Failed to delete todo: ' + (error.message || 'Please try again'));

                // Revert UI change
                todoCard.classList.remove('fall');
            }
        });
    } catch (error) {
        // Hide loading indicator
        hideLoadingMessage();

        console.error('Error deleting todo:', error);
        showErrorMessage('Failed to delete todo: ' + (error.message || 'Please try again'));
    }
}

function openEditModal(todo) {
    // Populate form fields
    editId.value = todo.id;
    editText.value = todo.text;
    editDate.value = todo.date;
    editTime.value = todo.time;
    editTag.value = todo.tag;
    editPriority.value = todo.priority;
    editNotes.value = todo.notes;

    // Show modal
    editModal.style.display = 'block';
}

function closeModal() {
    editModal.style.display = 'none';
}

async function saveEditedTodo(event) {
    event.preventDefault();

    // Validate input
    if (editText.value.trim() === '') {
        showErrorMessage('Please enter a task');
        return;
    }

    const id = editId.value;

    // Log the date and time values for debugging
    console.log('Edit date value:', editDate.value);
    console.log('Edit time value:', editTime.value);

    // Create updated todo object
    let dueDate = null;
    if (editDate.value) {
        try {
            // Combine date and time into a single Date object
            const dateTimeStr = editDate.value + (editTime.value ? 'T' + editTime.value : 'T00:00:00');
            dueDate = new Date(dateTimeStr);

            // Validate the date
            if (isNaN(dueDate.getTime())) {
                console.error('Invalid date/time combination:', dateTimeStr);
                dueDate = null;
            } else {
                console.log('Valid dueDate created:', dueDate);
                // Convert to ISO string for the API
                dueDate = dueDate.toISOString();
            }
        } catch (error) {
            console.error('Error creating dueDate:', error);
            dueDate = null;
        }
    }

    const todoData = {
        text: editText.value.trim(),
        dueDate: dueDate,
        tags: editTag.value ? [editTag.value] : [],
        priority: parseInt(editPriority.value) || 1,
        notes: editNotes.value
    };

    console.log('Sending updated todo data to API:', todoData);

    try {
        // Show loading indicator
        showLoadingMessage('Updating todo...');

        // Update todo in API
        await api.put(`/todos/${id}`, todoData);

        // Hide loading indicator
        hideLoadingMessage();

        // Show success message
        showSuccessMessage('Todo updated successfully');

        // Close modal
        closeModal();

        // Refresh todos
        getTodos();
    } catch (error) {
        // Hide loading indicator
        hideLoadingMessage();

        console.error('Error updating todo:', error);
        showErrorMessage('Failed to update todo: ' + (error.message || 'Please try again'));
    }
}

function filterTodos() {
    // Refresh todos with current filters
    getTodos();
}

function filterTodosList(todos) {
    // Get filter values
    const tagFilter = filterTag.value;
    const priorityFilter = parseInt(filterPriority.value);
    const statusFilter = filterStatus.value;

    // Apply filters
    return todos.filter(todo => {
        // Tag filter
        if (tagFilter && (!todo.tags || !todo.tags.includes(tagFilter))) {
            return false;
        }

        // Priority filter
        if (priorityFilter && todo.priority !== priorityFilter) {
            return false;
        }

        // Status filter
        if (statusFilter === 'completed' && !todo.completed) {
            return false;
        } else if (statusFilter === 'active' && todo.completed) {
            return false;
        }

        return true;
    });
}

function showErrorMessage(message) {
    // Remove any existing error messages first
    const existingMessages = document.querySelectorAll('.error-message');
    existingMessages.forEach(msg => msg.remove());

    // Create error message element
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;

    // Make sure it doesn't block interaction with other elements
    errorMessage.style.pointerEvents = 'none';

    // Add to page
    document.body.appendChild(errorMessage);

    // Remove after 3 seconds
    setTimeout(() => {
        errorMessage.classList.add('fade-out');

        // Add event listener for transition end
        errorMessage.addEventListener('transitionend', () => {
            errorMessage.remove();
        });

        // Backup: Force remove after additional 1 second in case transition fails
        setTimeout(() => {
            if (document.body.contains(errorMessage)) {
                errorMessage.remove();
            }
        }, 1000);
    }, 3000);
}

function showSuccessMessage(message) {
    // Remove any existing success messages first
    const existingMessages = document.querySelectorAll('.success-message');
    existingMessages.forEach(msg => msg.remove());

    // Create success message element
    const successMessage = document.createElement('div');
    successMessage.classList.add('success-message');
    successMessage.textContent = message;

    // Make sure it doesn't block interaction with other elements
    successMessage.style.pointerEvents = 'none';

    // Add to page
    document.body.appendChild(successMessage);

    // Remove after 3 seconds
    setTimeout(() => {
        successMessage.classList.add('fade-out');

        // Add event listener for transition end
        successMessage.addEventListener('transitionend', () => {
            successMessage.remove();
        });

        // Backup: Force remove after additional 1 second in case transition fails
        setTimeout(() => {
            if (document.body.contains(successMessage)) {
                successMessage.remove();
            }
        }, 1000);
    }, 3000);
}

function showLoadingMessage(message) {
    // Remove any existing loading messages
    hideLoadingMessage();

    // Create loading message element
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('loading-message');
    loadingMessage.textContent = message;

    // Make sure it doesn't block interaction with other elements
    loadingMessage.style.pointerEvents = 'none';

    // Add to page
    document.body.appendChild(loadingMessage);

    // Backup: Force remove after 10 seconds in case the hide function is never called
    setTimeout(() => {
        if (document.body.contains(loadingMessage)) {
            loadingMessage.remove();
        }
    }, 10000);
}

function hideLoadingMessage() {
    // Remove any existing loading messages
    const existingLoadingMessages = document.querySelectorAll('.loading-message');
    existingLoadingMessages.forEach(message => {
        message.remove();
    });
}



// Change theme function
function changeTheme(color) {
    document.body.className = color;
    localStorage.setItem('savedTheme', color);
    savedTheme = localStorage.getItem('savedTheme');
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === editModal) {
        closeModal();
    }
};
