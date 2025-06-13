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

// Check if user is logged in
if (!localStorage.getItem('token')) {
    // Redirect to login page if not logged in
    window.location.href = '../login/index.html';
}

// Functions
async function addTodo(event) {
    event.preventDefault();
    
    // Validate input
    if (todoInput.value.trim() === '') {
        showErrorMessage('Please enter a task');
        return;
    }
    
    // Create todo object
    const todoData = {
        text: todoInput.value.trim(),
        completed: false,
        dueDate: todoDate.value ? new Date(todoDate.value + (todoTime.value ? 'T' + todoTime.value : '')).toISOString() : null,
        tags: todoTag.value ? [todoTag.value] : [],
        priority: parseInt(todoPriority.value) || 1,
        notes: ''
    };
    
    try {
        // Call API to create todo
        const newTodo = await createTodo(todoData);
        
        // Render the new todo
        renderTodos();
        
        // Clear form
        todoForm.reset();
    } catch (error) {
        console.error('Error adding todo:', error);
        showErrorMessage('Failed to add todo. Please try again.');
    }
}

async function getTodos() {
    try {
        // Clear the container
        todoGridContainer.innerHTML = '';
        
        // Show loading indicator
        todoGridContainer.innerHTML = '<div class="loading">Loading...</div>';
        
        // Get todos from API
        const todos = await fetchTodos();
        
        // Render todos
        renderTodos(todos);
    } catch (error) {
        console.error('Error getting todos:', error);
        showErrorMessage('Failed to load todos. Please try again.');
        
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
    const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
    const formattedDate = dueDate ? dueDate.toLocaleDateString() : '';
    const formattedTime = dueDate ? dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    
    todoCard.innerHTML = `
        <div class="todo-actions">
            <button class="complete-btn ${todo.completed ? 'completed' : ''}">
                <i class="fas fa-check"></i>
            </button>
            <button class="edit-btn">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="todo-content">
            <h3 class="todo-text">${todo.text}</h3>
            ${dueDate ? `<p class="todo-date-time">${formattedDate} ${formattedTime}</p>` : ''}
            ${todo.tags && todo.tags.length > 0 ? `<p class="todo-tag">${todo.tags.join(', ')}</p>` : ''}
            <p class="todo-priority">Priority: ${['Low', 'Medium', 'High'][todo.priority - 1]}</p>
        </div>
    `;
    
    return todoCard;
}

function handleTodoClick(event) {
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
        
        // Parse date and time
        let todoDateTime = todoDateTimeText.trim().split(' ');
        let todoDateValue = '';
        let todoTimeValue = '';
        
        if (todoDateTime.length >= 1) {
            const dateParts = todoDateTime[0].split('/');
            if (dateParts.length === 3) {
                todoDateValue = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
            }
        }
        
        if (todoDateTime.length >= 2) {
            todoTimeValue = todoDateTime[1];
        }
        
        // Parse priority
        let todoPriorityValue = 1;
        if (todoPriorityText.includes('Medium')) {
            todoPriorityValue = 2;
        } else if (todoPriorityText.includes('High')) {
            todoPriorityValue = 3;
        }
        
        // Get the full todo object from the API
        fetch(`${API_BASE_URL}/todos/${todoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to get todo details');
            }
            return response.json();
        })
        .then(todo => {
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
        })
        .catch(error => {
            console.error('Error getting todo details:', error);
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
        });
    }
}

async function toggleComplete(id) {
    try {
        const todoCard = document.querySelector(`.todo-card[data-id="${id}"]`);
        const isCompleted = todoCard.classList.contains('completed');
        
        // Toggle completed status in UI
        todoCard.classList.toggle('completed');
        todoCard.querySelector('.complete-btn').classList.toggle('completed');
        
        // Update in API
        await toggleTodoComplete(id, !isCompleted);
    } catch (error) {
        console.error('Error toggling todo completion:', error);
        showErrorMessage('Failed to update todo status. Please try again.');
        
        // Revert UI change
        const todoCard = document.querySelector(`.todo-card[data-id="${id}"]`);
        todoCard.classList.toggle('completed');
        todoCard.querySelector('.complete-btn').classList.toggle('completed');
    }
}

async function deleteTodo(id) {
    try {
        // Remove from UI
        const todoCard = document.querySelector(`.todo-card[data-id="${id}"]`);
        todoCard.classList.add('fall');
        
        // Wait for animation to complete
        todoCard.addEventListener('transitionend', async function() {
            try {
                // Delete from API
                await deleteTodoItem(id);
                todoCard.remove();
            } catch (error) {
                console.error('Error deleting todo:', error);
                showErrorMessage('Failed to delete todo. Please try again.');
                
                // Revert UI change
                todoCard.classList.remove('fall');
            }
        });
    } catch (error) {
        console.error('Error deleting todo:', error);
        showErrorMessage('Failed to delete todo. Please try again.');
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
    
    // Create updated todo object
    const todoData = {
        text: editText.value.trim(),
        dueDate: editDate.value ? new Date(editDate.value + (editTime.value ? 'T' + editTime.value : '')).toISOString() : null,
        tags: editTag.value ? [editTag.value] : [],
        priority: parseInt(editPriority.value) || 1,
        notes: editNotes.value
    };
    
    try {
        // Update todo in API
        await updateTodo(id, todoData);
        
        // Close modal
        closeModal();
        
        // Refresh todos
        getTodos();
    } catch (error) {
        console.error('Error updating todo:', error);
        showErrorMessage('Failed to update todo. Please try again.');
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
    // Create error message element
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;
    
    // Add to page
    document.body.appendChild(errorMessage);
    
    // Remove after 3 seconds
    setTimeout(() => {
        errorMessage.classList.add('fade-out');
        errorMessage.addEventListener('transitionend', () => {
            errorMessage.remove();
        });
    }, 3000);
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
