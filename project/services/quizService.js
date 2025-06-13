/**
 * Quiz service for handling quiz-related API calls
 * This file contains methods for quiz CRUD operations, submissions, and results
 *
 * This service is designed to work with the SpringBoot backend at http://localhost:8080/api
 * It includes fallback mechanisms for when the backend is unavailable
 *
 * IMPORTANT: This service uses the SpringBoot backend in the backend/Kanzanso folder
 * and does not rely on any separate JavaScript backend.
 */

// Use the api instance from window.api
// This assumes the api object has been defined globally before this script loads

// Helper functions for quiz processing

/**
 * Calculate the total score from a quiz submission
 * @param {Object} submission - The quiz submission
 * @returns {number} - The total score
 */
function calculateTotalScore(submission) {
    if (submission.totalScore !== undefined) {
        return submission.totalScore;
    }

    let totalScore = 0;
    const questions = fallbackData.questions[submission.quizType] ||
                      fallbackData.questions.initial_assessment;

    // Calculate total score from answers
    for (const [questionId, answerIndex] of Object.entries(submission.answers)) {
        const question = questions.find(q => q.id === questionId) ||
                        questions[parseInt(questionId.replace('q', '')) - 1];

        if (question?.scores?.[answerIndex] !== undefined) {
            totalScore += question.scores[answerIndex];
        }
    }

    return totalScore;
}

/**
 * Calculate category scores from a quiz submission
 * @param {Object} submission - The quiz submission
 * @returns {Object} - Map of category scores
 */
function calculateCategoryScores(submission) {
    if (submission.categoryScores) {
        return submission.categoryScores;
    }

    const categoryScores = {};
    const questions = fallbackData.questions[submission.quizType] ||
                      fallbackData.questions.initial_assessment;

    // Group questions by category
    const questionsByCategory = {};
    for (const question of questions) {
        if (!questionsByCategory[question.category]) {
            questionsByCategory[question.category] = [];
        }
        questionsByCategory[question.category].push(question);
    }

    // Calculate score for each category
    for (const [category, categoryQuestions] of Object.entries(questionsByCategory)) {
        let categoryScore = 0;
        let answeredQuestions = 0;

        for (const question of categoryQuestions) {
            const answerIndex = submission.answers[question.id];
            if (answerIndex !== undefined && question.scores && question.scores[answerIndex] !== undefined) {
                categoryScore += question.scores[answerIndex];
                answeredQuestions++;
            }
        }

        // Only add category if at least one question was answered
        if (answeredQuestions > 0) {
            categoryScores[category] = categoryScore;
        }
    }

    return categoryScores;
}

/**
 * Generate an interpretation based on quiz results
 * @param {Object} submission - The quiz submission
 * @returns {string} - The interpretation text
 */
function generateInterpretation(submission) {
    if (submission.resultSummary) {
        return submission.resultSummary;
    }

    const totalScore = calculateTotalScore(submission);
    const quizType = submission.quizType;
    const categoryScores = calculateCategoryScores(submission);

    // Get the highest scoring category
    let highestCategory = '';
    let highestScore = 0;

    for (const [category, score] of Object.entries(categoryScores)) {
        if (score > highestScore) {
            highestScore = score;
            highestCategory = category;
        }
    }

    // Default interpretations based on quiz type and score
    const interpretations = {
        initial_assessment: {
            low: "DISORDER FREE: You don't seem to be suffering from any symptoms, and overall you are balanced and happy.",
            medium: "MILD SYMPTOMS: You're showing some signs of stress or anxiety, but they appear manageable.",
            high_anxiety: "ANXIETY: You are experiencing significant worry and anxiety that may be affecting your daily life.",
            high_depression: "DEPRESSION: You're showing signs of low mood and decreased interest that may benefit from attention.",
            high_social: "SOCIAL CHALLENGES: You may be experiencing some difficulties in social situations.",
            high_stress: "STRESS: Your results indicate elevated stress levels that would benefit from stress management techniques."
        },
        anxiety_focused: {
            low: "MINIMAL ANXIETY: Your anxiety levels appear to be within a manageable range.",
            medium: "MODERATE ANXIETY: You're experiencing some anxiety. The suggested techniques may help reduce your symptoms.",
            high: "SEVERE ANXIETY: Your anxiety levels are elevated. Consider speaking with a professional for additional support."
        },
        depression_focused: {
            low: "MINIMAL DEPRESSION: Your results suggest minimal depressive symptoms.",
            medium: "MODERATE DEPRESSION: You're showing some signs of depression. The suggested strategies may help improve your mood.",
            high: "SEVERE DEPRESSION: Your results indicate significant depressive symptoms. We recommend professional support."
        },
        weekly_checkin: {
            low: "GREAT WEEK: You're doing well this week. Keep up the good work!",
            medium: "MODERATE WEEK: You're experiencing some challenges this week. Focus on self-care.",
            high: "CHALLENGING WEEK: This has been a difficult week for you. Consider reaching out for additional support."
        },
        daily_mood: {
            low: "GOOD DAY: You're having a good day today!",
            medium: "OKAY DAY: You're having an okay day with some challenges.",
            high: "TOUGH DAY: Today has been challenging for you. Focus on self-care for the rest of the day."
        }
    };

    // Get the appropriate interpretation based on score range and quiz type
    const quizInterpretations = interpretations[quizType] || interpretations.initial_assessment;

    // For initial assessment, consider the highest category
    if (quizType === 'initial_assessment') {
        // The initial assessment has 10 questions with scores 1-4 each
        // Total possible score range: 10-40
        // Adjust thresholds to be more reasonable:
        // 10-20: Low (happy/healthy)
        // 21-30: Medium (mild symptoms)
        // 31-40: High (significant symptoms)

        if (totalScore <= 20) {
            return quizInterpretations.low;
        } else if (totalScore <= 30) {
            return quizInterpretations.medium;
        } else {
            // For high scores, consider the highest category
            if (highestCategory === 'anxiety') {
                return quizInterpretations.high_anxiety;
            } else if (highestCategory === 'depression' || highestCategory === 'mood') {
                return quizInterpretations.high_depression;
            } else if (highestCategory === 'social' || highestCategory === 'personality') {
                return quizInterpretations.high_social;
            } else {
                return quizInterpretations.high_stress;
            }
        }
    } else {
        // For other quiz types, adjust the ranges based on number of questions
        // Most other quizzes have 5 questions with scores 1-4 each
        // Total possible score range: 5-20

        if (totalScore <= 10) {
            return quizInterpretations.low;
        } else if (totalScore <= 15) {
            return quizInterpretations.medium;
        } else {
            return quizInterpretations.high;
        }
    }
}

/**
 * Generate recommendations based on quiz results
 * @param {Object} submission - The quiz submission
 * @returns {string} - The recommendations text
 */
function generateRecommendations(submission) {
    if (submission.recommendations) {
        return submission.recommendations;
    }

    const categoryScores = calculateCategoryScores(submission);
    let recommendations = "Based on your results, here are some recommendations:\n\n";

    // Add general recommendations
    recommendations += "• Practice mindfulness meditation for 10 minutes daily\n";
    recommendations += "• Maintain a regular sleep schedule\n";
    recommendations += "• Engage in physical activity for at least 30 minutes daily\n\n";

    // Add category-specific recommendations
    if (categoryScores.anxiety && categoryScores.anxiety > 3) {
        recommendations += "For anxiety:\n";
        recommendations += "• Try deep breathing exercises when feeling anxious\n";
        recommendations += "• Limit caffeine and alcohol consumption\n";
        recommendations += "• Practice progressive muscle relaxation\n\n";
    }

    if (categoryScores.mood && categoryScores.mood > 3) {
        recommendations += "For mood improvement:\n";
        recommendations += "• Schedule pleasant activities throughout your week\n";
        recommendations += "• Spend time in nature\n";
        recommendations += "• Connect with supportive friends or family\n\n";
    }

    if (categoryScores.stress && categoryScores.stress > 3) {
        recommendations += "For stress management:\n";
        recommendations += "• Identify and reduce stressors when possible\n";
        recommendations += "• Practice time management techniques\n";
        recommendations += "• Take short breaks throughout the day\n\n";
    }

    recommendations += "Remember that these are general suggestions. For personalized advice, consider consulting with a mental health professional.";

    return recommendations;
}

// Fallback data for when the backend is not available
// Expose this as a property of the quizService for client-side filtering
const fallbackData = {
    quizTypes: [
        'initial_assessment',
        'weekly_checkin',
        'anxiety_focused',
        'depression_focused',
        'daily_mood'
    ],
    questions: {
        initial_assessment: [
            {
                id: 'q1',
                text: 'DESCRIBE YOUR CURRENT MOOD',
                options: [
                    'Pretty happy',
                    'I am worried about some things',
                    'Antisocial',
                    "Terrible, I'm fed up"
                ],
                scores: [1, 2, 3, 4],
                category: 'mood',
                quizType: 'initial_assessment'
            },
            {
                id: 'q2',
                text: 'HOW DO PEOPLE DESCRIBE YOU?',
                options: [
                    "Happy",
                    'Socially Awkward',
                    'Cold',
                    'Unhappy'
                ],
                scores: [1, 2, 3, 4],
                category: 'personality',
                quizType: 'initial_assessment'
            },
            {
                id: 'q3',
                text: 'HOW OFTEN DO YOU FEEL ANXIOUS?',
                options: [
                    "Rarely",
                    'Sometimes',
                    'Often',
                    'Almost all the time'
                ],
                scores: [1, 2, 3, 4],
                category: 'anxiety',
                quizType: 'initial_assessment'
            },
            {
                id: 'q4',
                text: 'HOW WELL DO YOU SLEEP?',
                options: [
                    "Very well",
                    'Okay',
                    'Not great',
                    'Terribly'
                ],
                scores: [1, 2, 3, 4],
                category: 'physical',
                quizType: 'initial_assessment'
            },
            {
                id: 'q5',
                text: 'HOW OFTEN DO YOU FEEL HOPELESS?',
                options: [
                    "Never",
                    'Occasionally',
                    'Frequently',
                    'Constantly'
                ],
                scores: [1, 2, 3, 4],
                category: 'depression',
                quizType: 'initial_assessment'
            },
            {
                id: 'q6',
                text: 'HOW OFTEN DO YOU FEEL OVERWHELMED?',
                options: [
                    "Rarely",
                    'Sometimes',
                    'Often',
                    'Almost all the time'
                ],
                scores: [1, 2, 3, 4],
                category: 'stress',
                quizType: 'initial_assessment'
            },
            {
                id: 'q7',
                text: 'HOW WOULD YOU RATE YOUR ENERGY LEVELS?',
                options: [
                    "High energy most days",
                    'Moderate energy',
                    'Low energy often',
                    'Constantly fatigued'
                ],
                scores: [1, 2, 3, 4],
                category: 'physical',
                quizType: 'initial_assessment'
            },
            {
                id: 'q8',
                text: 'HOW OFTEN DO YOU FEEL IRRITABLE OR ANGRY?',
                options: [
                    "Rarely",
                    'Sometimes',
                    'Often',
                    'Almost all the time'
                ],
                scores: [1, 2, 3, 4],
                category: 'mood',
                quizType: 'initial_assessment'
            },
            {
                id: 'q9',
                text: 'HOW COMFORTABLE ARE YOU IN SOCIAL SITUATIONS?',
                options: [
                    "Very comfortable",
                    'Somewhat comfortable',
                    'Uncomfortable',
                    'Extremely uncomfortable'
                ],
                scores: [1, 2, 3, 4],
                category: 'social',
                quizType: 'initial_assessment'
            },
            {
                id: 'q10',
                text: 'HOW OFTEN DO YOU HAVE TROUBLE CONCENTRATING?',
                options: [
                    "Rarely",
                    'Sometimes',
                    'Often',
                    'Almost all the time'
                ],
                scores: [1, 2, 3, 4],
                category: 'cognitive',
                quizType: 'initial_assessment'
            }
        ],
        weekly_checkin: [
            {
                id: 'wq1',
                text: 'HOW WAS YOUR WEEK OVERALL?',
                options: [
                    'Great',
                    'Good',
                    'Okay',
                    'Bad'
                ],
                scores: [1, 2, 3, 4],
                category: 'weekly_checkin',
                quizType: 'weekly_checkin'
            },
            {
                id: 'wq2',
                text: 'HOW STRESSED DID YOU FEEL THIS WEEK?',
                options: [
                    'Not at all',
                    'A little',
                    'Moderately',
                    'Very stressed'
                ],
                scores: [1, 2, 3, 4],
                category: 'weekly_checkin',
                quizType: 'weekly_checkin'
            },
            {
                id: 'wq3',
                text: 'DID YOU MAKE TIME FOR SELF-CARE THIS WEEK?',
                options: [
                    'Yes, plenty',
                    'Some',
                    'Not much',
                    'None at all'
                ],
                scores: [1, 2, 3, 4],
                category: 'weekly_checkin',
                quizType: 'weekly_checkin'
            },
            {
                id: 'wq4',
                text: 'HOW WOULD YOU RATE YOUR PRODUCTIVITY THIS WEEK?',
                options: [
                    'Very productive',
                    'Somewhat productive',
                    'Not very productive',
                    'Not productive at all'
                ],
                scores: [1, 2, 3, 4],
                category: 'weekly_checkin',
                quizType: 'weekly_checkin'
            },
            {
                id: 'wq5',
                text: 'HOW WELL DID YOU MANAGE YOUR EMOTIONS THIS WEEK?',
                options: [
                    'Very well',
                    'Fairly well',
                    'Not very well',
                    'Poorly'
                ],
                scores: [1, 2, 3, 4],
                category: 'weekly_checkin',
                quizType: 'weekly_checkin'
            }
        ],
        anxiety_focused: [
            {
                id: 'aq1',
                text: 'HOW OFTEN DO YOU FEEL NERVOUS OR ANXIOUS?',
                options: [
                    'Rarely',
                    'Sometimes',
                    'Often',
                    'Almost always'
                ],
                scores: [1, 2, 3, 4],
                category: 'anxiety_focused',
                quizType: 'anxiety_focused'
            },
            {
                id: 'aq2',
                text: 'DO YOU WORRY EXCESSIVELY ABOUT DIFFERENT THINGS?',
                options: [
                    'Rarely',
                    'Sometimes',
                    'Often',
                    'Almost always'
                ],
                scores: [1, 2, 3, 4],
                category: 'anxiety_focused',
                quizType: 'anxiety_focused'
            },
            {
                id: 'aq3',
                text: 'DO YOU HAVE TROUBLE RELAXING?',
                options: [
                    'Rarely',
                    'Sometimes',
                    'Often',
                    'Almost always'
                ],
                scores: [1, 2, 3, 4],
                category: 'anxiety_focused',
                quizType: 'anxiety_focused'
            },
            {
                id: 'aq4',
                text: 'DO YOU EXPERIENCE PHYSICAL SYMPTOMS WHEN ANXIOUS (RACING HEART, SWEATING)?',
                options: [
                    'Rarely',
                    'Sometimes',
                    'Often',
                    'Almost always'
                ],
                scores: [1, 2, 3, 4],
                category: 'anxiety_focused',
                quizType: 'anxiety_focused'
            },
            {
                id: 'aq5',
                text: 'DO YOU AVOID SITUATIONS THAT MAKE YOU ANXIOUS?',
                options: [
                    'Rarely',
                    'Sometimes',
                    'Often',
                    'Almost always'
                ],
                scores: [1, 2, 3, 4],
                category: 'anxiety_focused',
                quizType: 'anxiety_focused'
            }
        ],
        depression_focused: [
            {
                id: 'dq1',
                text: 'HOW OFTEN DO YOU FEEL DOWN OR DEPRESSED?',
                options: [
                    'Rarely',
                    'Sometimes',
                    'Often',
                    'Almost always'
                ],
                scores: [1, 2, 3, 4],
                category: 'depression_focused',
                quizType: 'depression_focused'
            },
            {
                id: 'dq2',
                text: 'HOW IS YOUR INTEREST IN ACTIVITIES YOU USUALLY ENJOY?',
                options: [
                    'Normal',
                    'Slightly decreased',
                    'Significantly decreased',
                    'No interest at all'
                ],
                scores: [1, 2, 3, 4],
                category: 'depression_focused',
                quizType: 'depression_focused'
            },
            {
                id: 'dq3',
                text: 'DO YOU FEEL WORTHLESS OR GUILTY?',
                options: [
                    'Rarely',
                    'Sometimes',
                    'Often',
                    'Almost always'
                ],
                scores: [1, 2, 3, 4],
                category: 'depression_focused',
                quizType: 'depression_focused'
            },
            {
                id: 'dq4',
                text: 'HOW IS YOUR APPETITE?',
                options: [
                    'Normal',
                    'Somewhat decreased',
                    'Significantly decreased',
                    'No appetite or excessive eating'
                ],
                scores: [1, 2, 3, 4],
                category: 'depression_focused',
                quizType: 'depression_focused'
            },
            {
                id: 'dq5',
                text: 'DO YOU HAVE THOUGHTS OF HARMING YOURSELF?',
                options: [
                    'Never',
                    'Rarely',
                    'Sometimes',
                    'Often'
                ],
                scores: [1, 2, 3, 4],
                category: 'depression_focused',
                quizType: 'depression_focused'
            }
        ],
        daily_mood: [
            {
                id: 'dm1',
                text: 'HOW WOULD YOU RATE YOUR MOOD TODAY?',
                options: [
                    'Great',
                    'Good',
                    'Okay',
                    'Bad'
                ],
                scores: [1, 2, 3, 4],
                category: 'daily_mood',
                quizType: 'daily_mood'
            },
            {
                id: 'dm2',
                text: 'HOW IS YOUR ENERGY LEVEL TODAY?',
                options: [
                    'High',
                    'Medium',
                    'Low',
                    'Very low'
                ],
                scores: [1, 2, 3, 4],
                category: 'daily_mood',
                quizType: 'daily_mood'
            },
            {
                id: 'dm3',
                text: 'HOW WELL DID YOU SLEEP LAST NIGHT?',
                options: [
                    'Very well',
                    'Okay',
                    'Not great',
                    'Very poorly'
                ],
                scores: [1, 2, 3, 4],
                category: 'daily_mood',
                quizType: 'daily_mood'
            },
            {
                id: 'dm4',
                text: 'HOW PRODUCTIVE DO YOU FEEL TODAY?',
                options: [
                    'Very productive',
                    'Somewhat productive',
                    'Not very productive',
                    'Not productive at all'
                ],
                scores: [1, 2, 3, 4],
                category: 'daily_mood',
                quizType: 'daily_mood'
            },
            {
                id: 'dm5',
                text: 'HOW SOCIAL DO YOU FEEL TODAY?',
                options: [
                    'Very social',
                    'Somewhat social',
                    'Not very social',
                    'Not social at all'
                ],
                scores: [1, 2, 3, 4],
                category: 'daily_mood',
                quizType: 'daily_mood'
            }
        ]
    },
    results: {}
};

const quizService = {
    // Expose fallback data for client-side filtering
    fallbackData,
    // Expose helper functions for local calculations
    calculateTotalScore,
    calculateCategoryScores,
    generateInterpretation,
    generateRecommendations,
    /**
     * Get all available quiz types
     * @returns {Promise} - Promise with array of quiz types
     */
    getQuizTypes: async () => {
        try {
            // Use the SpringBoot endpoint for quiz types
            const response = await window.api.get('/quiz-types');
            return response.data;
        } catch (error) {
            console.error('Error getting quiz types:', error);
            // Use fallback data
            return fallbackData.quizTypes;
        }
    },

    /**
     * Get questions for a specific quiz type
     * @param {string} quizType - Type of quiz (e.g., 'initial_assessment', 'weekly_checkin')
     * @returns {Promise} - Promise with array of questions
     */
    getQuestionsByType: async (quizType) => {
        try {
            // Use the SpringBoot endpoint for quiz questions
            const response = await window.api.get(`/quiz-questions/type/${quizType}`);

            // Check if we got a valid response with data
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                console.log(`Received ${response.data.length} questions from backend for quiz type ${quizType}`);
                return response.data;
            } else {
                console.log(`Received empty or invalid response from backend for quiz type ${quizType}, using fallback data`);
                return fallbackData.questions[quizType] || fallbackData.questions.initial_assessment;
            }
        } catch (error) {
            console.error(`Error getting questions for quiz type ${quizType}:`, error);

            // Check if we're in fallback mode
            if (window.api.fallbackMode) {
                console.log(`Using fallback data for quiz type ${quizType} in fallback mode`);
            } else {
                console.log(`Network error, using fallback data for quiz type ${quizType}`);
            }

            // Use fallback data
            return fallbackData.questions[quizType] || fallbackData.questions.initial_assessment;
        }
    },

    /**
     * Get questions by category
     * @param {string} category - Category of questions
     * @returns {Promise} - Promise with array of questions
     */
    getQuestionsByCategory: async (category) => {
        try {
            // Use the SpringBoot endpoint for quiz questions by category
            const response = await window.api.get(`/quiz-questions/category/${category}`);
            return response.data;
        } catch (error) {
            console.error(`Error getting questions for category ${category}:`, error);
            // Return questions from fallback data that match the category
            const allQuestions = Object.values(fallbackData.questions).flat();
            return allQuestions.filter(q => q.category === category);
        }
    },

    /**
     * Get all questions
     * @returns {Promise} - Promise with array of questions
     */
    getAllQuestions: async () => {
        try {
            // Use the SpringBoot endpoint for all quiz questions
            const response = await window.api.get('/quiz-questions');
            return response.data;
        } catch (error) {
            console.error('Error getting all questions:', error);
            // Return all questions from fallback data
            return Object.values(fallbackData.questions).flat();
        }
    },

    /**
     * Submit quiz answers
     * @param {Object} submission - Quiz submission data including userId and answers
     * @returns {Promise} - Promise with the quiz result
     */
    submitQuiz: async (submission) => {
        try {
            // Format the submission to match the SpringBoot backend's expected structure
            const totalScore = calculateTotalScore(submission);
            const categoryScores = calculateCategoryScores(submission);
            const interpretation = generateInterpretation(submission);
            const recommendations = generateRecommendations(submission);

            console.log('Calculated scores for submission:', {
                totalScore,
                categoryScores,
                interpretation,
                recommendations
            });

            const quizResultDTO = {
                quizType: submission.quizType,
                userId: submission.userId, // Include userId for fallback mode
                score: totalScore,
                categoryScores: categoryScores,
                interpretation: interpretation,
                resultSummary: interpretation, // Add resultSummary for frontend display
                recommendations: recommendations,
                takenAt: new Date().toISOString()
            };

            // Call the SpringBoot backend endpoint with the user ID in the path
            // If userId is 'demo-user', replace it with the actual user ID
            let userId = submission.userId;
            if (userId === 'demo-user') {
                userId = '68052ca31a411b19ce4db257';
                console.log('Replaced demo-user with actual user ID:', userId);
            }
            console.log(`Submitting quiz result for user ID: ${userId} (fallback mode: ${window.api.fallbackMode})`);
            const response = await window.api.post(`/quiz-results/${userId}`, quizResultDTO);

            // If this is fallback data, store it locally as well
            if (response.fallbackData) {
                console.log('Storing quiz result locally in fallback mode');
                // The API interceptor should have already stored this
            }

            return response.data;
        } catch (error) {
            console.error('Error submitting quiz:', error);

            // If we're in fallback mode but the API interceptor didn't handle it,
            // store the result locally ourselves
            if (window.api.fallbackMode) {
                try {
                    // Calculate scores
                    const totalScore = calculateTotalScore(submission);
                    const categoryScores = calculateCategoryScores(submission);
                    const interpretation = generateInterpretation(submission);

                    console.log('Fallback mode calculated scores:', {
                        totalScore,
                        categoryScores,
                        interpretation
                    });

                    // Generate a mock ID for the result
                    const result = {
                        id: 'fallback-' + Math.random().toString(36).substring(2),
                        userId: submission.userId,
                        quizType: submission.quizType,
                        score: totalScore,
                        totalScore: totalScore, // For backward compatibility
                        categoryScores: categoryScores,
                        resultSummary: interpretation,
                        interpretation: interpretation,
                        createdAt: new Date().toISOString(),
                        takenAt: new Date().toISOString()
                    };

                    // Store in localStorage for persistence
                    const storageKey = 'fallback_quiz_results';
                    let storedResults = JSON.parse(localStorage.getItem(storageKey) || '[]');
                    storedResults.push(result);
                    localStorage.setItem(storageKey, JSON.stringify(storedResults));

                    console.log('Manually stored quiz result in localStorage for fallback mode');
                    return result;
                } catch (storageError) {
                    console.error('Error storing quiz result locally:', storageError);
                }
            }

            // If all else fails, use the original fallback mechanism
            const totalScore = calculateTotalScore(submission);
            const categoryScores = calculateCategoryScores(submission);
            const interpretation = generateInterpretation(submission);

            console.log('Last resort fallback calculated scores:', {
                totalScore,
                categoryScores,
                interpretation
            });

            const result = {
                id: 'local-' + Date.now(),
                userId: submission.userId,
                quizType: submission.quizType,
                score: totalScore,
                totalScore: totalScore, // For backward compatibility
                categoryScores: categoryScores,
                resultSummary: interpretation,
                interpretation: interpretation,
                createdAt: new Date().toISOString(),
                takenAt: new Date().toISOString()
            };

            // Store the result in fallback data
            if (!fallbackData.results[submission.userId]) {
                fallbackData.results[submission.userId] = [];
            }
            fallbackData.results[submission.userId].push(result);

            return result;
        }
    },

    /**
     * Get quiz results for a user
     * @param {string} userId - User ID
     * @returns {Promise} - Promise with array of quiz results
     */
    getQuizResultsByUserId: async (userId) => {
        try {
            // Use the endpoint from the QuizResultController
            // If userId is 'demo-user', replace it with the actual user ID
            let formattedUserId = userId;
            if (formattedUserId === 'demo-user') {
                formattedUserId = '68052ca31a411b19ce4db257';
                console.log('Replaced demo-user with actual user ID:', formattedUserId);
            }
            console.log(`Getting quiz results for user ID: ${formattedUserId} (fallback mode: ${window.api.fallbackMode})`);
            const response = await window.api.get(`/quiz-results/${formattedUserId}`);

            // Check if we got a valid response with data
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                console.log(`Received ${response.data.length} quiz results from backend for user ${userId}`);
                return response.data;
            } else {
                console.log(`Received empty quiz results from backend for user ${userId}, checking local storage`);
                // Fall through to check local storage
            }
        } catch (error) {
            console.error(`Error getting quiz results for user ${userId}:`, error);
            // Fall through to check local storage
        }

        // Check for locally stored results first (from fallback mode submissions)
        const storageKey = 'fallback_quiz_results';
        try {
            const storedResults = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (storedResults.length > 0) {
                // Filter results for this user if userId is in the result
                const userResults = storedResults.filter(result =>
                    result.userId === userId ||
                    (result.user && result.user.id === userId)
                );

                if (userResults.length > 0) {
                    console.log(`Found ${userResults.length} locally stored results for user ${userId}`);
                    return userResults;
                }
            }
        } catch (storageError) {
            console.error('Error reading from localStorage:', storageError);
        }

        // Fall back to hardcoded data if no local storage results
        console.log(`No results found in localStorage for user ${userId}, using fallback data`);
        return fallbackData.results[userId] || [];
    },

    /**
     * Get latest quiz results for a user
     * @param {string} userId - User ID
     * @returns {Promise} - Promise with array of latest quiz results
     */
    getLatestQuizResultsByUserId: async (userId) => {
        try {
            // Use the SpringBoot endpoint for latest quiz results
            // If userId is 'demo-user', replace it with the actual user ID
            let formattedUserId = userId;
            if (formattedUserId === 'demo-user') {
                formattedUserId = '68052ca31a411b19ce4db257';
                console.log('Replaced demo-user with actual user ID:', formattedUserId);
            }
            console.log(`Getting latest quiz results for user ID: ${formattedUserId} (fallback mode: ${window.api.fallbackMode})`);
            const response = await window.api.get(`/quiz-results/${formattedUserId}/latest`);

            // Check if we got a valid response with data
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                console.log(`Received ${response.data.length} latest quiz results from backend for user ${userId}`);
                return response.data;
            } else {
                console.log(`Received empty latest quiz results from backend for user ${userId}, checking local storage`);
                // Fall through to check local storage
            }
        } catch (error) {
            console.error(`Error getting latest quiz results for user ${userId}:`, error);
            // Fall through to check local storage
        }

        // Check for locally stored results first (from fallback mode submissions)
        const storageKey = 'fallback_quiz_results';
        try {
            const storedResults = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (storedResults.length > 0) {
                // Filter results for this user if userId is in the result
                const userResults = storedResults.filter(result =>
                    result.userId === userId ||
                    (result.user && result.user.id === userId)
                );

                if (userResults.length > 0) {
                    console.log(`Found ${userResults.length} locally stored results for user ${userId}`);
                    // Sort by date (most recent first) and limit to 5
                    return userResults
                        .sort((a, b) => {
                            const dateA = a.takenAt || a.createdAt;
                            const dateB = b.takenAt || b.createdAt;
                            return new Date(dateB) - new Date(dateA);
                        })
                        .slice(0, 5);
                }
            }
        } catch (storageError) {
            console.error('Error reading from localStorage:', storageError);
        }

        // Return latest results from fallback data
        console.log(`No latest results found in localStorage for user ${userId}, using fallback data`);
        const results = fallbackData.results[userId] || [];
        return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    },

    /**
     * Get user progress over time
     * @param {string} userId - User ID
     * @returns {Promise} - Promise with progress data
     */
    getUserProgressOverTime: async (userId) => {
        try {
            // Use the SpringBoot endpoint for user progress
            // If userId is 'demo-user', replace it with the actual user ID
            let formattedUserId = userId;
            if (formattedUserId === 'demo-user') {
                formattedUserId = '68052ca31a411b19ce4db257';
                console.log('Replaced demo-user with actual user ID:', formattedUserId);
            }
            console.log(`Getting progress data for user ID: ${formattedUserId} (fallback mode: ${window.api.fallbackMode})`);
            const response = await window.api.get(`/quiz-results/${formattedUserId}/progress`);

            // Check if we got a valid response with data
            if (response.data?.data?.datasets) {
                console.log(`Received progress data from backend for user ${userId}`);
                return response.data;
            } else {
                console.log(`Received invalid progress data from backend for user ${userId}, calculating locally`);
                // Fall through to calculate locally
            }
        } catch (error) {
            console.error(`Error getting progress data for user ${userId}:`, error);
            // Fall through to calculate locally
        }

        // Calculate progress from available results
        try {
            const results = await quizService.getQuizResultsByUserId(userId);
            if (results && results.length > 0) {
                console.log(`Calculating progress from ${results.length} results for user ${userId}`);

                // Group results by week
                const resultsByWeek = {};
                const now = new Date();

                results.forEach(result => {
                    const resultDate = new Date(result.createdAt || result.takenAt);
                    const weekDiff = Math.floor((now - resultDate) / (7 * 24 * 60 * 60 * 1000));
                    const weekLabel = weekDiff === 0 ? "This Week" : `${weekDiff} Week${weekDiff > 1 ? 's' : ''} Ago`;

                    if (!resultsByWeek[weekLabel]) {
                        resultsByWeek[weekLabel] = [];
                    }
                    resultsByWeek[weekLabel].push(result);
                });

                // Calculate average scores by week
                const labels = Object.keys(resultsByWeek).sort((a, b) => {
                    if (a === "This Week") return -1;
                    if (b === "This Week") return 1;
                    return parseInt(a) - parseInt(b);
                });

                const moodScores = [];
                const anxietyScores = [];

                labels.forEach(week => {
                    const weekResults = resultsByWeek[week];
                    const moodAvg = weekResults.reduce((sum, r) => sum + (r.categoryScores?.mood || 0), 0) / weekResults.length;
                    const anxietyAvg = weekResults.reduce((sum, r) => sum + (r.categoryScores?.anxiety || 0), 0) / weekResults.length;

                    moodScores.push(moodAvg || 0);
                    anxietyScores.push(anxietyAvg || 0);
                });

                return {
                    userId: userId,
                    message: "Progress calculated from your quiz history",
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: "Mood Score",
                                data: moodScores
                            },
                            {
                                label: "Anxiety Score",
                                data: anxietyScores
                            }
                        ]
                    }
                };
            }
        } catch (calcError) {
            console.error("Error calculating progress:", calcError);
        }

        // Return placeholder progress data if calculation fails
        console.log(`No results available to calculate progress for user ${userId}, using placeholder data`);
        return {
            userId: userId,
            message: "Progress tracking is available in offline mode",
            data: {
                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                datasets: [
                    {
                        label: "Mood Score",
                        data: [7, 6, 8, 5]
                    },
                    {
                        label: "Anxiety Score",
                        data: [8, 7, 6, 5]
                    }
                ]
            }
        };
    },

    /**
     * Get personalized recommendations based on quiz results
     * @param {string} userId - User ID
     * @returns {Promise} - Promise with recommendations
     */
    getPersonalizedRecommendations: async (userId) => {
        try {
            // Use the SpringBoot endpoint for personalized recommendations
            // If userId is 'demo-user', replace it with the actual user ID
            let formattedUserId = userId;
            if (formattedUserId === 'demo-user') {
                formattedUserId = '68052ca31a411b19ce4db257';
                console.log('Replaced demo-user with actual user ID:', formattedUserId);
            }
            console.log(`Getting recommendations for user ID: ${formattedUserId} (fallback mode: ${window.api.fallbackMode})`);
            const response = await window.api.get(`/quiz-results/${formattedUserId}/recommendations`);

            // Check if we got a valid response with data
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                console.log(`Received ${response.data.length} recommendations from backend for user ${userId}`);
                return response.data;
            } else {
                console.log(`Received empty recommendations from backend for user ${userId}, generating locally`);
                // Fall through to generate locally
            }
        } catch (error) {
            console.error(`Error getting recommendations for user ${userId}:`, error);
            // Fall through to generate locally
        }

        // Try to get results from localStorage first
        const storageKey = 'fallback_quiz_results';
        try {
            const storedResults = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (storedResults.length > 0) {
                // Filter results for this user
                const userResults = storedResults.filter(result =>
                    result.userId === userId ||
                    (result.user && result.user.id === userId)
                );

                if (userResults.length > 0) {
                    console.log(`Found ${userResults.length} locally stored results for user ${userId}`);
                    // Sort by date (most recent first)
                    const latestResult = userResults.sort((a, b) => {
                        const dateA = a.takenAt || a.createdAt;
                        const dateB = b.takenAt || b.createdAt;
                        return new Date(dateB) - new Date(dateA);
                    })[0];

                    // Generate recommendations based on the latest result
                    return generateRecommendationsFromResult(latestResult);
                }
            }
        } catch (storageError) {
            console.error('Error reading from localStorage:', storageError);
        }

        // If no localStorage results, try fallback data
        const results = fallbackData.results[userId] || [];
        if (results.length > 0) {
            const latestResult = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            return generateRecommendationsFromResult(latestResult);
        }

        // Default recommendations if no results found
        console.log(`No results found for user ${userId}, using default recommendations`);
        return [
            {
                text: "Practice mindfulness meditation for 10 minutes daily",
                link: "../meditation/index.html"
            },
            {
                text: "Track your mood in the mood tracker",
                link: "../know_yourself/index.html#mood-tracker"
            },
            {
                text: "Set small, achievable goals in your to-do list",
                link: "../to_do_list/index.html"
            }
        ];
    }
};

// Helper function to generate recommendations based on a result
function generateRecommendationsFromResult(result) {
    if (!result?.resultSummary) {
        return [
            {
                text: "Practice mindfulness meditation for 10 minutes daily",
                link: "../meditation/index.html"
            },
            {
                text: "Track your mood in the mood tracker",
                link: "../know_yourself/index.html#mood-tracker"
            },
            {
                text: "Set small, achievable goals in your to-do list",
                link: "../to_do_list/index.html"
            }
        ];
    }

    const resultType = result.resultSummary.split(':')[0];

    if (resultType.includes('ANXIETY')) {
        return [
            {
                text: "Try breathing exercises to reduce anxiety",
                link: "../meditation/index.html#breathing"
            },
            {
                text: "Create a worry list to organize your thoughts",
                link: "../to_do_list/index.html"
            },
            {
                text: "Practice progressive muscle relaxation",
                link: "../meditation/index.html#relaxation"
            }
        ];
    } else if (resultType.includes('DEPRESSION')) {
        return [
            {
                text: "Listen to mood-lifting music",
                link: "../playlist/index.html"
            },
            {
                text: "Set small, achievable goals",
                link: "../to_do_list/index.html"
            },
            {
                text: "Track positive moments in your gratitude journal",
                link: "../know_yourself/index.html#gratitude"
            }
        ];
    } else if (resultType.includes('ANTISOCIAL')) {
        return [
            {
                text: "Set a small social goal each day",
                link: "../to_do_list/index.html"
            },
            {
                text: "Practice self-reflection",
                link: "../know_yourself/index.html"
            },
            {
                text: "Try self-care challenges",
                link: "../mini_games/streaks/index.html"
            }
        ];
    }

    // Default recommendations
    return [
        {
            text: "Practice mindfulness meditation for 10 minutes daily",
            link: "../meditation/index.html"
        },
        {
            text: "Track your mood in the mood tracker",
            link: "../know_yourself/index.html#mood-tracker"
        },
        {
            text: "Set small, achievable goals in your to-do list",
            link: "../to_do_list/index.html"
        }
    ];
}

// Make the service available globally for direct browser usage
window.quizService = quizService;