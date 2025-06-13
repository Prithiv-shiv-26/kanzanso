/**
 * Demo Data Generator
 * This script generates sample user activity data for testing the Daily Boost feature
 */

// Function to generate demo data
function generateDemoData() {
    console.log('Generating demo data for Daily Boost...');
    
    // Set user ID if not already set
    if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', 'demo-user');
    }
    
    // Set user name if not already set
    if (!localStorage.getItem('userName')) {
        localStorage.setItem('userName', 'Demo User');
    }
    
    // Generate journal entries
    const journalEntries = [];
    const emotions = ['happy', 'sad', 'anxious', 'excited', 'calm', 'frustrated', 'grateful'];
    const journalPrompts = [
        'Today I felt...',
        'I am grateful for...',
        'I am looking forward to...',
        'Something that challenged me today was...',
        'A small win I had today was...'
    ];
    
    // Generate entries for the past 10 days
    for (let i = 0; i < 10; i++) {
        // Skip some days to simulate irregular journaling
        if (i === 2 || i === 5 || i === 8) continue;
        
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        journalEntries.push({
            id: `journal-${date.getTime()}`,
            content: `${journalPrompts[Math.floor(Math.random() * journalPrompts.length)]} ${Math.random().toString(36).substring(2, 15)}`,
            emotions: [emotions[Math.floor(Math.random() * emotions.length)]],
            date: date.toISOString()
        });
    }
    
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    localStorage.setItem('lastJournalDate', journalEntries[0].date);
    
    // Generate mood entries
    const moodEntries = [];
    const moods = ['happy', 'sad', 'anxious', 'excited', 'calm', 'frustrated', 'neutral'];
    const factors = ['work', 'relationships', 'health', 'weather', 'sleep', 'exercise', 'food'];
    
    // Generate entries for the past 14 days
    for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        moodEntries.push({
            id: `mood-${date.getTime()}`,
            mood: moods[Math.floor(Math.random() * moods.length)],
            intensity: Math.floor(Math.random() * 5) + 1,
            factors: [factors[Math.floor(Math.random() * factors.length)]],
            date: date.toISOString()
        });
    }
    
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
    
    // Generate quiz results
    const quizResults = [];
    const quizTypes = ['initial_assessment', 'weekly_checkin', 'anxiety_focused', 'depression_focused', 'daily_mood'];
    const resultSummaries = [
        'DISORDER FREE: You don\'t seem to be suffering from any symptoms, and overall you are balanced and happy.',
        'ANXIETY: You are a serious worrier, and you fear that a panic attack could strike at any time.',
        'ANTISOCIAL: You prefer to be on your own and you struggle to develop relationships with others.',
        'DEPRESSION: You are burdened by feelings of hopelessness and helplessness, and you aren\'t truly engaged in life.'
    ];
    
    // Generate 3 quiz results
    for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7)); // One quiz per week
        
        quizResults.push({
            id: `quiz-${date.getTime()}`,
            quizType: quizTypes[Math.floor(Math.random() * quizTypes.length)],
            resultSummary: resultSummaries[Math.floor(Math.random() * resultSummaries.length)],
            score: Math.floor(Math.random() * 40) + 10,
            date: date.toISOString()
        });
    }
    
    localStorage.setItem('quizResults', JSON.stringify(quizResults));
    localStorage.setItem('lastQuizDate', quizResults[0].date);
    
    // Generate completed todos
    const completedTodos = [];
    const todoCategories = ['work', 'personal', 'health', 'social', 'self-care'];
    const todoTitles = [
        'Complete project report',
        'Go for a 30-minute walk',
        'Call a friend',
        'Read a chapter of a book',
        'Meditate for 10 minutes',
        'Drink 8 glasses of water',
        'Clean the kitchen',
        'Plan meals for the week',
        'Practice a hobby',
        'Write in journal'
    ];
    
    // Generate entries for the past 10 days
    for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Add 1-3 todos per day
        const todosPerDay = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < todosPerDay; j++) {
            completedTodos.push({
                id: `todo-${date.getTime()}-${j}`,
                title: todoTitles[Math.floor(Math.random() * todoTitles.length)],
                category: todoCategories[Math.floor(Math.random() * todoCategories.length)],
                priority: Math.floor(Math.random() * 10) + 1,
                date: date.toISOString()
            });
        }
    }
    
    localStorage.setItem('completedTodos', JSON.stringify(completedTodos));
    
    // Set last meditation date
    const lastMeditationDate = new Date();
    lastMeditationDate.setDate(lastMeditationDate.getDate() - Math.floor(Math.random() * 5));
    localStorage.setItem('lastMeditationDate', lastMeditationDate.toISOString());
    
    // Generate some insights
    const insights = [];
    const insightTitles = [
        'Mood Patterns',
        'Emotional Awareness',
        'Self-Care Priority',
        'Reflection Habit',
        'Managing Stress'
    ];
    const insightContents = [
        'Your mood has been varied lately. Noticing these patterns can help you understand what affects your emotional wellbeing.',
        'You\'ve been acknowledging your emotions regularly. This awareness is an important step in emotional intelligence.',
        'You\'ve been making time for self-care. This commitment to your wellbeing builds resilience.',
        'Regular journaling helps process emotions and clarify thoughts. Your consistent practice is building self-awareness.',
        'You\'ve been experiencing stress recently. Remember to take breaks and practice self-care activities that help you relax.'
    ];
    const insightSources = ['Mood Tracker', 'Journal', 'To-Do List', 'Mental Health Quiz'];
    
    // Generate 3 insights
    for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 5));
        
        insights.push({
            id: `insight-${date.getTime()}`,
            title: insightTitles[Math.floor(Math.random() * insightTitles.length)],
            content: insightContents[Math.floor(Math.random() * insightContents.length)],
            source: insightSources[Math.floor(Math.random() * insightSources.length)],
            date: date.toISOString()
        });
    }
    
    localStorage.setItem('unlockedInsights', JSON.stringify(insights));
    
    // Set streak and completion data
    localStorage.setItem('dailyBoostStreak', Math.floor(Math.random() * 5) + 1);
    localStorage.setItem('totalChallengesCompleted', Math.floor(Math.random() * 20) + 5);
    
    // Set today's date for last completion
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('lastChallengeCompletionDate', today);
    
    // Set completed challenges for today
    const completedToday = ['journal-1', 'mood-2'];
    localStorage.setItem('challengesCompletedToday', JSON.stringify(completedToday));
    
    console.log('Demo data generated successfully!');
}

// Run the generator when the script is loaded
generateDemoData();