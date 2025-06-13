// We now use the fallback data from quizService.js

// Global variables
let questions = [];
let currentQuizType = '';
let currentIndex = 0;
let totalQuestions = 0;
let userAnswers = {};
// Get the user ID from localStorage
// If the user is not logged in, we'll handle this in the submitQuiz function
let userId = localStorage.getItem('userId');
console.log('User ID from localStorage:', userId);

// If userId is 'demo-user', replace it with the actual user ID
if (userId === 'demo-user') {
    userId = '68052ca31a411b19ce4db257';
    console.log('Replaced demo-user with actual user ID:', userId);
    localStorage.setItem('userId', userId);
}

// DOM Elements
const quizTypeSelection = document.getElementById('quiz-type-selection');
const quizQuestions = document.getElementById('quiz-questions');
const resultsSection = document.getElementById('results-section');
const historySection = document.getElementById('history-section');
const quesBox = document.getElementById('quesBox');
const optionInputs = document.querySelectorAll('.option-input');
const optionLabels = document.querySelectorAll('.option-label');
const submitBtn = document.getElementById('submit-btn');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const quizTypes = document.querySelectorAll('.quiz-type');
const viewHistoryBtn = document.getElementById('view-history-btn');
const viewHistoryMainBtn = document.getElementById('view-history-main-btn');
const takeAnotherBtn = document.getElementById('take-another-btn');
const backToResultsBtn = document.getElementById('back-to-results-btn');
const backToQuizBtn = document.getElementById('back-to-quiz-btn');

// Initialize the app
function init() {
    // Check if user is logged in
    if (!userId) {
        console.log('User is not logged in. Redirecting to login page...');
        // Redirect to login page
        const baseUrl = window.location.href.split('/mental_health_quiz/')[0];
        const loginPage = baseUrl + '/login/login.html';
        window.location.href = loginPage + '?redirect=quiz';
        return;
    }

    console.log('User is logged in with ID:', userId);

    // Make sure we're not in fallback mode
    if (window.api.fallbackMode) {
        console.log('Warning: Fallback mode is enabled. Disabling it to ensure we use the real backend.');
        window.api.fallbackMode = false;
    }

    console.log('Using real backend for all API calls');

    // Add event listeners
    quizTypes.forEach(type => {
        type.addEventListener('click', () => startQuiz(type.dataset.type));
    });

    submitBtn.addEventListener('click', submitAnswer);
    viewHistoryBtn.addEventListener('click', () => {
        // Show history from results page
        showHistory('results');
    });
    viewHistoryMainBtn.addEventListener('click', () => {
        // Show history from main page
        showHistory('main');
    });
    takeAnotherBtn.addEventListener('click', resetQuiz);
    backToResultsBtn.addEventListener('click', () => {
        historySection.style.display = 'none';
        resultsSection.style.display = 'block';
    });
    backToQuizBtn.addEventListener('click', () => {
        historySection.style.display = 'none';
        quizTypeSelection.style.display = 'block';
    });

    // Check if user has taken quizzes before
    checkUserHistory();

    // Check if there's a pending quiz after login
    const pendingQuiz = sessionStorage.getItem('pendingQuiz');
    if (pendingQuiz && userId) {
        try {
            console.log('Found pending quiz after login');
            const quizData = JSON.parse(pendingQuiz);

            // Clear the pending quiz
            sessionStorage.removeItem('pendingQuiz');

            // Start the quiz
            startQuiz(quizData.quizType);

            // Restore answers
            if (quizData.answers) {
                userAnswers = quizData.answers;
            }
        } catch (error) {
            console.error('Error restoring pending quiz:', error);
        }
    }
}

// Check if user has taken quizzes before to personalize the experience
async function checkUserHistory() {
    try {
        // Make sure we're not in fallback mode
        if (window.api.fallbackMode) {
            console.log('Warning: Fallback mode is enabled. Disabling it to ensure we use the real backend.');
            window.api.fallbackMode = false;
        }

        console.log('Using real backend to check user history');

        // Try to get results from the backend
        const results = await quizService.getQuizResultsByUserId(userId);
        if (results && results.length > 0) {
            // User has taken quizzes before, we could personalize the UI here
            console.log('User has taken quizzes before (from backend)');
        }
    } catch (error) {
        console.error('Error checking user history:', error);
        // Continue with default experience
    }
}

// Start a quiz of the selected type
async function startQuiz(quizType) {
    currentQuizType = quizType;
    userAnswers = {};
    currentIndex = 0;

    try {
        // Make sure we're not in fallback mode
        if (window.api.fallbackMode) {
            console.log('Warning: Fallback mode is enabled. Disabling it to ensure we use the real backend.');
            window.api.fallbackMode = false;
        }

        console.log('Using real backend to get quiz questions');

        // Get questions from API
        questions = await quizService.getQuestionsByType(quizType);

        // Filter questions by quiz type on the client side as well
        // This ensures we only get questions for the selected quiz type
        // even if the backend doesn't filter them properly
        if (questions && questions.length > 0) {
            // If the questions have a quizType property, filter by it
            if (questions[0].quizType) {
                questions = questions.filter(q => q.quizType === quizType);
                console.log(`Filtered to ${questions.length} questions with quizType=${quizType}`);
            }

            // If we still have no questions with matching quiz type,
            // use the fallback data
            if (questions.length === 0) {
                console.log(`No questions found for quiz type: ${quizType}, using fallback data`);
                questions = quizService.fallbackData.questions[quizType] || [];
            }

            // Ensure we have the right number of questions for each quiz type
            const expectedQuestionCount = {
                'initial_assessment': 10,
                'weekly_checkin': 5,
                'anxiety_focused': 5,
                'depression_focused': 5,
                'daily_mood': 5
            };

            const expected = expectedQuestionCount[quizType] || 5;

            if (questions.length !== expected) {
                console.log(`Expected ${expected} questions for ${quizType}, but got ${questions.length}. Using fallback data.`);
                questions = quizService.fallbackData.questions[quizType] || [];

                // If fallback data doesn't have the right number either, just use what we have
                if (questions.length !== expected) {
                    console.log(`Fallback data has ${questions.length} questions for ${quizType}, which is not the expected ${expected}, but we'll use it anyway.`);
                }
            }
        }

        totalQuestions = questions.length;
        console.log(`Loaded ${totalQuestions} questions for quiz type: ${quizType}`);

        // Hide quiz selection, show questions
        quizTypeSelection.style.display = 'none';
        quizQuestions.style.display = 'block';

        // Load first question
        loadQuestion();
    } catch (error) {
        console.error('Error starting quiz:', error);
        alert('There was an error loading the quiz. Please try again later.');
    }
}

// Load the current question
function loadQuestion() {
    if (currentIndex >= totalQuestions) {
        finishQuiz();
        return;
    }

    // Reset radio buttons
    resetOptions();

    // Update progress
    updateProgress();

    // Get current question
    const question = questions[currentIndex];

    // Update question text
    quesBox.innerText = `${currentIndex + 1}. ${question.text}`;

    // Update options
    for (let i = 0; i < 4; i++) {
        const optionRow = optionInputs[i].closest('.option-row');

        if (i < question.options.length) {
            optionRow.style.display = 'flex';
            optionLabels[i].innerText = question.options[i];
        } else {
            // Hide extra options if question has fewer than 4
            optionRow.style.display = 'none';
        }
    }
}

// Update progress bar and text
function updateProgress() {
    const percentage = (currentIndex / totalQuestions) * 100;
    progressFill.style.width = `${percentage}%`;
    progressText.innerText = `Question ${currentIndex + 1} of ${totalQuestions}`;
}

// Submit the current answer
function submitAnswer() {
    const selectedOption = getSelectedOption();

    if (selectedOption === -1) {
        alert('Please select an option before continuing.');
        return;
    }

    // Save the answer
    const questionId = questions[currentIndex].id || `q${currentIndex}`;
    userAnswers[questionId] = selectedOption;

    // Move to next question
    currentIndex++;
    loadQuestion();
}

// Get the selected option index
function getSelectedOption() {
    for (let i = 0; i < optionInputs.length; i++) {
        if (optionInputs[i].checked) {
            return i;
        }
    }
    return -1;
}

// Reset all radio buttons
function resetOptions() {
    optionInputs.forEach(input => {
        input.checked = false;
    });
}

// Finish the quiz and submit answers
async function finishQuiz() {
    // Prepare submission data
    const submission = {
        userId: userId,
        quizType: currentQuizType,
        answers: userAnswers
    };

    try {
        console.log('Submitting quiz for user:', userId);

        // Make sure we're not in fallback mode
        if (window.api.fallbackMode) {
            console.log('Warning: Fallback mode is enabled. Disabling it to ensure we use the real backend.');
            window.api.fallbackMode = false;
        }

        console.log('Using real backend to submit quiz');

        // Submit to API (with fallback handled in the service)
        const result = await quizService.submitQuiz(submission);

        if (result) {
            displayResults(result);
        } else {
            throw new Error('No result returned from quiz submission');
        }
    } catch (error) {
        console.error('Error submitting quiz:', error);

        // Try to calculate results locally as a last resort
        try {
            console.log('Calculating results locally as fallback');
            const localResult = calculateLocalResults(submission);
            displayResults(localResult);
        } catch (fallbackError) {
            console.error('Even local calculation failed:', fallbackError);
            alert('There was an error processing your results. Please try again.');
            resetQuiz();
        }
    }
}

// Calculate results locally as fallback
function calculateLocalResults(submission) {
    // If no submission is provided, create one from current state
    if (!submission) {
        submission = {
            userId: userId || 'guest',
            quizType: currentQuizType,
            answers: userAnswers
        };
    }

    // If userId is not set in the submission, use 'guest'
    if (!submission.userId) {
        submission.userId = 'guest';
    }

    console.log('Calculating local results for submission:', submission);

    // Calculate total score and category scores
    const totalScore = quizService.calculateTotalScore(submission);
    const categoryScores = quizService.calculateCategoryScores(submission);

    // Generate interpretation based on scores
    const interpretation = quizService.generateInterpretation(submission);

    console.log('Local calculation results:', { totalScore, categoryScores, interpretation });

    // Return a properly formatted result
    return {
        id: 'local-' + Date.now(),
        userId: submission.userId,
        quizType: submission.quizType,
        score: totalScore,
        totalScore: totalScore, // For backward compatibility
        categoryScores: categoryScores,
        resultSummary: interpretation,
        createdAt: new Date().toISOString()
    };
}

// Display quiz results
function displayResults(result) {
    // Hide questions section
    quizQuestions.style.display = 'none';

    // Show results section
    resultsSection.style.display = 'block';

    // Update result summary
    const resultSummary = document.getElementById('result-summary');
    const resultDetails = document.getElementById('result-details');
    const recommendationsElement = document.getElementById('recommendations');

    // Display result summary
    console.log('Displaying result:', result);

    // If resultSummary is missing or just "RESULT", try to generate it
    if (!result.resultSummary || result.resultSummary === 'RESULT' || result.resultSummary.startsWith('PROCESSING')) {
        console.log('Result summary missing or invalid, generating one');
        // Create a submission object from the result
        const submission = {
            userId: result.userId,
            quizType: result.quizType,
            answers: result.answers || {},
            totalScore: result.totalScore || result.score || 0,
            categoryScores: result.categoryScores || {}
        };

        // Generate an interpretation
        result.resultSummary = quizService.generateInterpretation(submission);
        console.log('Generated result summary:', result.resultSummary);
    }

    const summaryParts = result.resultSummary.split(':');
    resultSummary.innerHTML = `
        <h3>${summaryParts[0]}</h3>
        <p>${summaryParts[1] || ''}</p>
    `;

    // Display category scores
    let categoryHtml = '<h3>Category Breakdown</h3><ul>';

    // Check if categoryScores exists and is an object
    if (result.categoryScores && typeof result.categoryScores === 'object') {
        for (const [category, score] of Object.entries(result.categoryScores)) {
            categoryHtml += `<li><strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong> ${score} points</li>`;
        }
    } else {
        categoryHtml += '<li>No category breakdown available</li>';
    }

    categoryHtml += '</ul>';
    resultDetails.innerHTML = categoryHtml;

    // Display recommendations
    getRecommendations(result, recommendationsElement);
}

// Get personalized recommendations based on results
async function getRecommendations(result, element) {
    // If no element is provided, get it from the DOM
    if (!element) {
        element = document.getElementById('recommendations');
    }

    // If user is not logged in, use fallback recommendations
    if (!userId) {
        console.log('User not logged in, using fallback recommendations');
        displayFallbackRecommendations(result, element);
        return;
    }

    try {
        // Make sure we're not in fallback mode
        if (window.api.fallbackMode) {
            console.log('Warning: Fallback mode is enabled. Disabling it to ensure we use the real backend.');
            window.api.fallbackMode = false;
        }

        console.log('Using real backend to fetch recommendations');
        const recs = await quizService.getPersonalizedRecommendations(userId);

        if (recs?.message) {
            // API not fully implemented yet, use fallback
            displayFallbackRecommendations(result, element);
        } else {
            // Display API recommendations
            let recsHtml = '<h3>Personalized Recommendations</h3><ul>';
            recs.forEach(rec => {
                recsHtml += `<li>${rec.text} <a href="${rec.link}">Learn more</a></li>`;
            });
            recsHtml += '</ul>';
            element.innerHTML = recsHtml;
        }
    } catch (error) {
        console.error('Error getting recommendations:', error);
        displayFallbackRecommendations(result, element);
    }
}

// Display fallback recommendations based on result type
function displayFallbackRecommendations(result, element) {
    // Safely extract result type
    const resultType = result.resultSummary ? result.resultSummary.split(':')[0] : '';
    let recsHtml = '<h3>Recommended Activities</h3><ul>';

    if (resultType.includes('ANXIETY')) {
        recsHtml += `
            <li>Try our <a href="../meditation/index.html">Meditation exercises</a> to calm your mind</li>
            <li>Practice deep breathing with our <a href="../mini_games/streaks/breath.html">Breathing exercise game</a></li>
            <li>Create a worry list in your <a href="../to_do_list/index.html">To-Do List</a> to organize your thoughts</li>
        `;
    } else if (resultType.includes('DEPRESSION')) {
        recsHtml += `
            <li>Listen to mood-lifting music in our <a href="../playlist/index.html">Playlist section</a></li>
            <li>Set small, achievable goals in your <a href="../to_do_list/index.html">To-Do List</a></li>
            <li>Track positive moments in the <a href="../know_yourself/index.html#gratitude">Gratitude Journal</a></li>
        `;
    } else if (resultType.includes('ANTISOCIAL')) {
        recsHtml += `
            <li>Set a small social goal each day in your <a href="../to_do_list/index.html">To-Do List</a></li>
            <li>Practice self-reflection in the <a href="../know_yourself/index.html">Know Yourself</a> section</li>
            <li>Try our <a href="../mini_games/streaks/index.html">Self-Care Challenges</a> to build healthy habits</li>
        `;
    } else {
        recsHtml += `
            <li>Maintain your well-being with our <a href="../meditation/index.html">Meditation exercises</a></li>
            <li>Track your mood in the <a href="../know_yourself/index.html#mood-tracker">Mood Tracker</a></li>
            <li>Set personal growth goals in your <a href="../to_do_list/index.html">To-Do List</a></li>
        `;
    }

    recsHtml += '</ul>';
    element.innerHTML = recsHtml;
}

// Show quiz history
async function showHistory(source = 'results') {
    // We already check for login at initialization, but just in case
    if (!userId) {
        console.log('User is not logged in. Cannot show history.');
        alert('You need to be logged in to view your quiz history.');
        return;
    }

    // Hide all sections
    quizTypeSelection.style.display = 'none';
    quizQuestions.style.display = 'none';
    resultsSection.style.display = 'none';

    // Show history section
    historySection.style.display = 'block';

    // Show/hide the appropriate back button based on source
    if (source === 'results') {
        backToResultsBtn.style.display = 'block';
        backToQuizBtn.style.display = 'none';
    } else {
        backToResultsBtn.style.display = 'none';
        backToQuizBtn.style.display = 'block';
    }

    // Set up filter event listeners
    const typeFilter = document.getElementById('history-type-filter');
    const timeFilter = document.getElementById('history-time-filter');

    typeFilter.addEventListener('change', filterHistory);
    timeFilter.addEventListener('change', filterHistory);

    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<p>Loading your history...</p>';

    try {
        console.log('Fetching quiz history for user:', userId);

        // Make sure we're not in fallback mode
        if (window.api.fallbackMode) {
            console.log('Warning: Fallback mode is enabled. Disabling it to ensure we use the real backend.');
            window.api.fallbackMode = false;
        }

        console.log('Using real backend to fetch quiz history');
        const results = await quizService.getQuizResultsByUserId(userId);

        // Debug: Log the results to see what's coming back
        console.log('Quiz results from API:', results);

        // Log the first result in detail to see its structure
        if (results && results.length > 0) {
            console.log('First result details:');
            for (const key in results[0]) {
                console.log(`${key}: ${JSON.stringify(results[0][key])}`);
            }
        }

        if (!results || results.length === 0) {
            historyList.innerHTML = '<p>No previous quiz results found. Try taking a quiz first!</p>';
            return;
        }

        // Validate each result before processing
        const validResults = results.filter(result => {
            return result && typeof result === 'object';
        });

        if (validResults.length === 0) {
            historyList.innerHTML = '<p>No valid quiz results found. Try taking a quiz first!</p>';
            return;
        }

        // Display history items
        let historyHtml = '';
        validResults.forEach(result => {
            try {
                // Handle null or undefined values with safe access
                let quizType = 'UNKNOWN QUIZ';
                if (result.quizType && typeof result.quizType === 'string') {
                    quizType = result.quizType.replace('_', ' ').toUpperCase();
                }

                // Use takenAt or createdAt for the date
                let date = 'Unknown date';
                try {
                    if (result.takenAt) {
                        // Handle different date formats
                        if (typeof result.takenAt === 'string') {
                            date = new Date(result.takenAt).toLocaleDateString();
                        } else if (result.takenAt.year && result.takenAt.month && result.takenAt.day) {
                            // Handle Java LocalDateTime format
                            date = new Date(result.takenAt.year, result.takenAt.monthValue - 1, result.takenAt.dayOfMonth).toLocaleDateString();
                        }
                    } else if (result.createdAt) {
                        date = new Date(result.createdAt).toLocaleDateString();
                    }
                } catch (err) {
                    console.error('Error parsing date:', err, result.takenAt || result.createdAt);
                }

                // Use interpretation or resultSummary for the summary
                const resultSummary = result.interpretation || result.resultSummary || 'No summary available';

                // Use score or totalScore for the score
                const totalScore = result.score !== undefined ? result.score :
                                  result.totalScore !== undefined ? result.totalScore : 'N/A';

                // Store the raw date for filtering
                const rawDate = result.takenAt || result.createdAt || new Date().toISOString();

                // Get the quiz type value for the data attribute
                const quizTypeValue = result.quizType || 'unknown';

                historyHtml += `
                    <div class="history-item" data-quiz-type="${quizTypeValue}" data-date="${rawDate}">
                        <div class="history-item-header">
                            <h3>${quizType}</h3>
                            <span class="history-date">${date}</span>
                        </div>
                        <p>${resultSummary}</p>
                        <div class="history-score">Score: ${totalScore}</div>
                    </div>
                `;
            } catch (err) {
                console.error('Error processing result item:', err, result);
                // Skip this result and continue with the next one
            }
        });

        if (historyHtml === '') {
            historyList.innerHTML = '<p>Could not display any quiz results. Try taking a quiz first!</p>';
        } else {
            historyList.innerHTML = historyHtml;
        }

        // In a real implementation, we would also render a chart here
        // showing progress over time

    } catch (error) {
        console.error('Error loading history:', error);
        historyList.innerHTML = '<p>Error loading history. Please try taking a quiz first!</p>';
    }
}

// Filter history based on selected filters
function filterHistory() {
    const typeFilter = document.getElementById('history-type-filter').value;
    const timeFilter = document.getElementById('history-time-filter').value;
    const historyItems = document.querySelectorAll('.history-item');

    if (!historyItems.length) return;

    historyItems.forEach(item => {
        let showItem = true;

        // Filter by quiz type
        if (typeFilter !== 'all') {
            const quizType = item.getAttribute('data-quiz-type');
            if (quizType !== typeFilter) {
                showItem = false;
            }
        }

        // Filter by time
        if (timeFilter !== 'all' && showItem) {
            const dateStr = item.getAttribute('data-date');
            if (dateStr) {
                const itemDate = new Date(dateStr);
                const now = new Date();

                if (timeFilter === 'week') {
                    // Past week
                    const weekAgo = new Date();
                    weekAgo.setDate(now.getDate() - 7);
                    if (itemDate < weekAgo) {
                        showItem = false;
                    }
                } else if (timeFilter === 'month') {
                    // Past month
                    const monthAgo = new Date();
                    monthAgo.setMonth(now.getMonth() - 1);
                    if (itemDate < monthAgo) {
                        showItem = false;
                    }
                } else if (timeFilter === 'year') {
                    // Past year
                    const yearAgo = new Date();
                    yearAgo.setFullYear(now.getFullYear() - 1);
                    if (itemDate < yearAgo) {
                        showItem = false;
                    }
                }
            }
        }

        // Show or hide the item
        item.style.display = showItem ? 'block' : 'none';
    });

    // Check if any items are visible
    const visibleItems = document.querySelectorAll('.history-item[style="display: block;"]');
    if (visibleItems.length === 0) {
        const historyList = document.getElementById('history-list');
        const noResultsMsg = document.querySelector('.no-results-message');

        if (!noResultsMsg) {
            const message = document.createElement('p');
            message.className = 'no-results-message';
            message.style.textAlign = 'center';
            message.style.padding = '1rem';
            message.style.color = '#666';
            message.innerText = 'No quiz results match your filters. Try different filter options.';
            historyList.appendChild(message);
        } else {
            noResultsMsg.style.display = 'block';
        }
    } else {
        const noResultsMsg = document.querySelector('.no-results-message');
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
}

// Reset the quiz to start over
function resetQuiz() {
    resultsSection.style.display = 'none';
    quizTypeSelection.style.display = 'block';
    currentIndex = 0;
    userAnswers = {};
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
