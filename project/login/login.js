// Handle signup form submission
const signupForm = document.querySelector('.signup');
const signupError = document.getElementById('signup-error');

// Client-side validation function
function validateSignupForm(name, email, password) {
    const errors = [];

    // Validate name
    if (!name || name.trim().length < 2) {
        errors.push("Name must be at least 2 characters");
    }

    if (name && !/^[a-zA-Z0-9\s._-]+$/.test(name)) {
        errors.push("Name can only contain letters, numbers, spaces, dots, underscores, and hyphens");
    }

    // Validate email
    if (!email || !email.includes('@') || !email.includes('.')) {
        errors.push("Please enter a valid email address");
    }

    // Validate password - match backend requirements
    if (!password || password.length < 6) {
        errors.push("Password must be at least 6 characters");
    } else {
        const passwordChecks = [
            { regex: /[0-9]/, message: "at least one digit" },
            { regex: /[a-z]/, message: "at least one lowercase letter" },
            { regex: /[A-Z]/, message: "at least one uppercase letter" },
            { regex: /[@#$%^&+=!]/, message: "at least one special character (@#$%^&+=!)" },
            { regex: /^\S+$/, message: "no whitespace" }
        ];

        const failedChecks = passwordChecks
            .filter(check => !check.regex.test(password))
            .map(check => check.message);

        if (failedChecks.length > 0) {
            errors.push("Password must contain " + failedChecks.join(", "));
        }
    }

    return errors;
}

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signupError.textContent = '';

    const name = signupForm.name.value;
    const email = signupForm.email.value;
    const password = signupForm.password.value;

    // Perform client-side validation first
    const validationErrors = validateSignupForm(name, email, password);
    if (validationErrors.length > 0) {
        signupError.textContent = validationErrors.join(". ");
        return;
    }

    // Check if we need to enable fallback mode
    if (!api.fallbackMode) {
        console.log('Checking if fallback mode is needed for signup');
    }

    try {
        // Use the userService to create a new user
        const userData = {
            name,
            email,
            password
        };

        console.log('Creating new user:', name, email);

        // Create the user
        const newUser = await userService.createUser(userData);
        console.log('User created successfully:', newUser);

        // Now login with the new credentials
        const user = await userService.login(email, password);
        console.log('Login successful after signup:', user);

        // Reset form and redirect
        signupForm.reset();

        // Redirect to home page
        console.log('Signup successful, redirecting to home page');

        // Use a more reliable redirect method
        const baseUrl = window.location.href.split('/login/')[0];
        const homePage = baseUrl + '/home.html';
        console.log('Redirecting to:', homePage);

        // Use location.replace for a clean redirect without history
        window.location.replace(homePage);
    } catch (error) {
        console.error('Signup error:', error);
        if (error.response && error.response.data) {
            // Display validation errors
            const errors = error.response.data;
            console.log('Error response data:', errors);

            if (typeof errors === 'object') {
                if (errors.errors && Array.isArray(errors.errors)) {
                    // Spring validation errors format
                    const errorMessages = errors.errors.map(err => err.defaultMessage || err.message).join('. ');
                    signupError.textContent = errorMessages;
                } else {
                    // Generic object format
                    const errorMessages = Object.values(errors).join('. ');
                    signupError.textContent = errorMessages;
                }
            } else if (typeof errors === 'string') {
                signupError.textContent = errors;
            } else {
                signupError.textContent = 'Error creating account. Please try again.';
            }
        } else if (typeof error === 'string') {
            signupError.textContent = error;
        } else if (error.message) {
            signupError.textContent = error.message;
        } else {
            signupError.textContent = 'Error creating account. Please try again.';
        }
    }
});

// Handle login form submission
const loginForm = document.querySelector('.login');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    console.log('Login attempt with email:', email);

    // Check if API is defined and if we need to enable fallback mode
    if (window.api && !window.api.fallbackMode) {
        console.log('Checking if fallback mode is needed for login');
    } else if (!window.api) {
        console.error('API not defined. Make sure api.js is loaded before login.js');
        // Create a fallback API if it doesn't exist
        window.api = {
            fallbackMode: true,
            post: async () => ({ data: {} })
        };
    }

    try {
        // Use the userService login method
        const user = await userService.login(email, password);

        console.log('Login successful:', user);

        // Reset form and redirect
        loginForm.reset();

        // Check if we need to redirect back to the quiz
        const urlParams = new URLSearchParams(window.location.search);
        const redirectParam = urlParams.get('redirect');

        if (redirectParam === 'quiz') {
            console.log('Login successful, redirecting back to quiz');
            const baseUrl = window.location.href.split('/login/')[0];
            const quizPage = baseUrl + '/mental_health_quiz/index.html';
            console.log('Redirecting to:', quizPage);
            window.location.replace(quizPage);
        } else {
            // Redirect to home page
            console.log('Login successful, redirecting to home page');
            const baseUrl = window.location.href.split('/login/')[0];
            const homePage = baseUrl + '/home.html';
            console.log('Redirecting to:', homePage);
            window.location.replace(homePage);
        }
    } catch (error) {
        console.error('Login error:', error);

        if (typeof error === 'string') {
            loginError.textContent = error;
        } else if (error.message) {
            loginError.textContent = error.message;
        } else if (error.response && error.response.status === 401) {
            loginError.textContent = 'Invalid email or password';
        } else if (error.response && error.response.data) {
            if (typeof error.response.data === 'string') {
                loginError.textContent = error.response.data;
            } else if (error.response.data.message) {
                loginError.textContent = error.response.data.message;
            } else if (error.response.data.error) {
                loginError.textContent = error.response.data.error;
            } else {
                loginError.textContent = 'Login failed. Please check console for details.';
            }
        } else {
            loginError.textContent = 'Login failed. Please check your email and password.';
        }
    }
});

// Handle the sign-in/sign-up toggle
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});
