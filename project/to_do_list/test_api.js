// Test script for Todo API connectivity
document.addEventListener('DOMContentLoaded', function() {
    // Add a test button to the page
    const testButton = document.createElement('button');
    testButton.textContent = 'Test API Connection';
    testButton.style.position = 'fixed';
    testButton.style.bottom = '20px';
    testButton.style.right = '20px';
    testButton.style.zIndex = '1000';
    testButton.style.padding = '10px';
    testButton.style.backgroundColor = '#4CAF50';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '4px';
    testButton.style.cursor = 'pointer';

    document.body.appendChild(testButton);

    // Add a result div
    const resultDiv = document.createElement('div');
    resultDiv.style.position = 'fixed';
    resultDiv.style.bottom = '70px';
    resultDiv.style.right = '20px';
    resultDiv.style.zIndex = '1000';
    resultDiv.style.padding = '10px';
    resultDiv.style.backgroundColor = '#f5f5f5';
    resultDiv.style.border = '1px solid #ddd';
    resultDiv.style.borderRadius = '4px';
    resultDiv.style.maxWidth = '400px';
    resultDiv.style.maxHeight = '300px';
    resultDiv.style.overflow = 'auto';
    resultDiv.style.display = 'none';

    document.body.appendChild(resultDiv);

    // Test API connection when button is clicked
    testButton.addEventListener('click', async function() {
        // Disable the button to prevent double clicks
        testButton.disabled = true;
        testButton.style.opacity = '0.7';
        testButton.style.cursor = 'not-allowed';

        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<p>Testing API connection...</p>';

        try {
            // Test authentication
            const token = localStorage.getItem('token');
            if (!token) {
                resultDiv.innerHTML = '<p style="color: red;">❌ No authentication token found in localStorage</p>';
                return;
            }

            resultDiv.innerHTML += `<p>Found token: ${token.substring(0, 10)}...</p>`;

            // Test API connection
            const API_BASE_URL = 'http://localhost:8080/api';

            // Test GET /todos
            try {
                const response = await fetch(`${API_BASE_URL}/todos`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    resultDiv.innerHTML += `<p style="color: green;">✅ GET /todos successful</p>`;
                    resultDiv.innerHTML += `<p>Retrieved ${data.length} todos</p>`;
                } else {
                    const errorText = await response.text();
                    resultDiv.innerHTML += `<p style="color: red;">❌ GET /todos failed: ${response.status} ${response.statusText}</p>`;
                    resultDiv.innerHTML += `<p>Error: ${errorText}</p>`;
                }
            } catch (error) {
                resultDiv.innerHTML += `<p style="color: red;">❌ GET /todos error: ${error.message}</p>`;
            }

            // Test POST /todos
            try {
                const testTodo = {
                    text: "Test todo " + new Date().toISOString(),
                    completed: false,
                    priority: 1,
                    tags: ["test"]
                };

                const response = await fetch(`${API_BASE_URL}/todos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(testTodo)
                });

                if (response.ok) {
                    const data = await response.json();
                    resultDiv.innerHTML += `<p style="color: green;">✅ POST /todos successful</p>`;
                    resultDiv.innerHTML += `<p>Created todo with ID: ${data.id}</p>`;

                    // Test DELETE /todos/{id}
                    try {
                        const deleteResponse = await fetch(`${API_BASE_URL}/todos/${data.id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (deleteResponse.ok) {
                            resultDiv.innerHTML += `<p style="color: green;">✅ DELETE /todos/${data.id} successful</p>`;
                        } else {
                            const errorText = await deleteResponse.text();
                            resultDiv.innerHTML += `<p style="color: red;">❌ DELETE /todos/${data.id} failed: ${deleteResponse.status} ${deleteResponse.statusText}</p>`;
                            resultDiv.innerHTML += `<p>Error: ${errorText}</p>`;
                        }
                    } catch (error) {
                        resultDiv.innerHTML += `<p style="color: red;">❌ DELETE /todos/${data.id} error: ${error.message}</p>`;
                    }
                } else {
                    const errorText = await response.text();
                    resultDiv.innerHTML += `<p style="color: red;">❌ POST /todos failed: ${response.status} ${response.statusText}</p>`;
                    resultDiv.innerHTML += `<p>Error: ${errorText}</p>`;
                }
            } catch (error) {
                resultDiv.innerHTML += `<p style="color: red;">❌ POST /todos error: ${error.message}</p>`;
            }

            // Test CORS
            try {
                const response = await fetch(`${API_BASE_URL}/test/cors`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    resultDiv.innerHTML += `<p style="color: green;">✅ CORS test successful</p>`;
                } else {
                    const errorText = await response.text();
                    resultDiv.innerHTML += `<p style="color: red;">❌ CORS test failed: ${response.status} ${response.statusText}</p>`;
                    resultDiv.innerHTML += `<p>Error: ${errorText}</p>`;
                }
            } catch (error) {
                resultDiv.innerHTML += `<p style="color: red;">❌ CORS test error: ${error.message}</p>`;
            }

        } catch (error) {
            resultDiv.innerHTML += `<p style="color: red;">❌ Error: ${error.message}</p>`;
        } finally {
            // Re-enable the button after a short delay
            setTimeout(() => {
                testButton.disabled = false;
                testButton.style.opacity = '1';
                testButton.style.cursor = 'pointer';
            }, 1000);
        }
    });

    // Close result div when clicked
    resultDiv.addEventListener('click', function() {
        resultDiv.style.display = 'none';
    });
});
