// Debug script to log todo data
console.log('Debug script loaded');

// Add a debug function to log todo data
function debugLogTodo(todo) {
    console.log('Todo object:', todo);
    console.log('Todo dueDate:', todo.dueDate);
    if (todo.dueDate) {
        console.log('Todo dueDate type:', typeof todo.dueDate);
        console.log('Todo dueDate parsed:', new Date(todo.dueDate));
    }
}

// Override the API get method to log response data
const originalGet = api.get;
api.get = async function(url, config) {
    const response = await originalGet.call(this, url, config);
    
    if (url.includes('/todos')) {
        console.log('API GET response for todos:', response.data);
        
        if (Array.isArray(response.data)) {
            response.data.forEach(todo => {
                console.log('Todo item dueDate:', todo.dueDate);
            });
        } else if (response.data && typeof response.data === 'object') {
            console.log('Single todo item dueDate:', response.data.dueDate);
        }
    }
    
    return response;
};

// Override the API post method to log request data
const originalPost = api.post;
api.post = async function(url, data, config) {
    if (url.includes('/todos')) {
        console.log('API POST request for todos:', data);
        console.log('Todo dueDate in request:', data.dueDate);
    }
    
    return await originalPost.call(this, url, data, config);
};

// Override the API put method to log request data
const originalPut = api.put;
api.put = async function(url, data, config) {
    if (url.includes('/todos')) {
        console.log('API PUT request for todos:', data);
        console.log('Todo dueDate in request:', data.dueDate);
    }
    
    return await originalPut.call(this, url, data, config);
};

console.log('Debug overrides installed');
