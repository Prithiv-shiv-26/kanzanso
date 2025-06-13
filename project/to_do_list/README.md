# To-Do List API Debugging Guide

This guide will help you debug and fix issues with the To-Do List API integration.

## Common Issues

1. **API URL Mismatch**: The application uses different API URLs in different files.
2. **Authentication Token Issues**: The JWT token might not be properly stored or retrieved.
3. **CORS Configuration**: CORS might not be properly configured on the backend.
4. **Fallback Mode Interference**: The fallback mode might be interfering with actual API calls.
5. **MongoDB Connection**: MongoDB might not be running or properly configured.

## New Approach

The new implementation addresses these issues with the following improvements:

1. **Automatic MongoDB Connection Detection**:
   - The application now automatically checks if MongoDB is running
   - If MongoDB is not running, it automatically switches to fallback mode

2. **Improved Token Handling**:
   - Automatically generates a demo token if none is found
   - Properly handles token validation errors

3. **Better Fallback Mode**:
   - More consistent fallback mode detection
   - Clearer logging of when fallback mode is being used
   - Smoother transition between API and localStorage

4. **Enhanced Error Handling**:
   - Detailed error messages in the console
   - User-friendly error messages in the UI
   - Loading indicators during API operations

## Testing the API

1. Open the original to-do list page:
   ```
   http://localhost:8080/project/to_do_list/index.html
   ```

2. Click the "Test API Connection" button in the bottom right corner to run API tests.

3. Check the console (F12) for detailed error messages.

## Using the Fixed Version

1. Open the fixed version of the to-do list page:
   ```
   http://localhost:8080/project/to_do_list/fixed_index.html
   ```

2. This version includes:
   - Improved error handling
   - Better logging
   - Loading indicators
   - Success messages
   - More detailed error messages

## Debugging Steps

### 1. Check MongoDB Connection

Make sure MongoDB is running:

```bash
mongod --version
```

If MongoDB is not installed, install it:

```bash
# For Windows (using Chocolatey)
choco install mongodb

# For macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
```

Start MongoDB:

```bash
# For Windows
net start MongoDB

# For macOS
brew services start mongodb-community
```

### 2. Check Backend Logs

Look for error messages in the Spring Boot console.

### 3. Test API Endpoints Directly

Use the apitest.html page to test API endpoints:

```
http://localhost:8080/project/apitest.html
```

### 4. Check Authentication Token

Make sure you're logged in and have a valid token:

1. Open the browser console (F12)
2. Run: `console.log(localStorage.getItem('token'))`
3. If the token is missing or invalid, log out and log back in

### 5. Check CORS Configuration

Make sure CORS is properly configured in the backend:

1. Check `WebConfig.java` for CORS configuration
2. Make sure `allowedOrigins` includes your frontend URL or uses `*`
3. If using `*`, make sure `allowCredentials` is set to `false`

## Files to Check

1. **Frontend**:
   - `api_service.js` - API service for to-do list
   - `main.js` - Main to-do list functionality
   - `fixed_api_service.js` - Fixed API service
   - `fixed_main.js` - Fixed main functionality

2. **Backend**:
   - `TodoItemController.java` - Controller for to-do list API
   - `TodoItemService.java` - Service for to-do list operations
   - `WebConfig.java` - CORS configuration
   - `JwtUtil.java` - JWT token utilities

## Common Fixes

1. **API URL Mismatch**: Use a consistent API URL across all files.
2. **Authentication Token**: Make sure the token is properly stored and retrieved.
3. **CORS Configuration**: Update CORS configuration to allow requests from your frontend.
4. **Fallback Mode**: Disable fallback mode when testing with a real backend.
5. **MongoDB Connection**: Make sure MongoDB is running and properly configured.

## Testing with Postman

You can also test the API endpoints using Postman:

1. Get all todos:
   - Method: GET
   - URL: http://localhost:8080/api/todos
   - Headers:
     - Authorization: Bearer YOUR_TOKEN

2. Create a todo:
   - Method: POST
   - URL: http://localhost:8080/api/todos
   - Headers:
     - Authorization: Bearer YOUR_TOKEN
     - Content-Type: application/json
   - Body:
     ```json
     {
       "text": "Test todo",
       "completed": false,
       "priority": 1,
       "tags": ["test"]
     }
     ```

3. Update a todo:
   - Method: PUT
   - URL: http://localhost:8080/api/todos/{id}
   - Headers:
     - Authorization: Bearer YOUR_TOKEN
     - Content-Type: application/json
   - Body:
     ```json
     {
       "text": "Updated todo",
       "completed": true,
       "priority": 2,
       "tags": ["test", "updated"]
     }
     ```

4. Delete a todo:
   - Method: DELETE
   - URL: http://localhost:8080/api/todos/{id}
   - Headers:
     - Authorization: Bearer YOUR_TOKEN

## Migration Process

We've created a migration plan to replace the old files with the new, improved versions:

1. **Testing Phase**:
   - Test the new implementation using `fixed_index.html`
   - Verify that it works correctly with the backend

2. **Migration Phase**:
   - Run `migrate.bat` to automatically:
     - Back up the original files
     - Replace them with the new versions
     - Update the index.html file

3. **Rollback Plan**:
   - If issues occur, run `rollback.bat` to restore the original files

See `MIGRATION_PLAN.md` for detailed information about the migration process.

## Next Steps

1. Test the fixed version of the to-do list by opening `fixed_index.html`
2. Use the API testing tool to identify specific issues
3. Check the backend logs for any errors
4. Verify MongoDB is running and properly configured
5. If everything works correctly, run the migration script
6. If issues persist, follow the debugging steps in this README