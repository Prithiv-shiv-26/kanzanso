package net.kanzanso.config;

import net.kanzanso.model.Question;
import net.kanzanso.repository.QuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    @Profile("!test") // Don't run this in test profile
    public CommandLineRunner initData(QuestionRepository questionRepository) {
        return args -> {
            // Only seed if the repository is empty
            if (questionRepository.count() == 0) {
                seedQuizQuestions(questionRepository);
            }
        };
    }

    private void seedQuizQuestions(QuestionRepository questionRepository) {
        // Initial Assessment Questions
        List<Question> initialAssessmentQuestions = Arrays.asList(
            new Question(null, "DESCRIBE YOUR CURRENT MOOD", 
                Arrays.asList("Pretty happy", "I am worried about some things", "Antisocial", "Terrible, I'm fed up"),
                Arrays.asList(1, 2, 3, 4), "mood"),
            new Question(null, "HOW DO PEOPLE DESCRIBE YOU?", 
                Arrays.asList("Happy", "Socially Awkward", "Cold", "Unhappy"),
                Arrays.asList(1, 2, 3, 4), "personality"),
            new Question(null, "DO YOU THINK YOU HAVE A MENTAL HEALTH ISSUE?", 
                Arrays.asList("I don't think so", "I'm worried that I'm too anxious", "I think I'm too antisocial", "Well, I feel very sad a lot of the time"),
                Arrays.asList(1, 2, 3, 4), "self_awareness"),
            new Question(null, "WHAT'S YOUR ROLE IN YOUR FAMILY?", 
                Arrays.asList("The fun, sociable one", "The sensible one", "I don't have a role, I'm an outsider", "The quiet one"),
                Arrays.asList(1, 2, 3, 4), "social"),
            new Question(null, "DO YOU LIKE TO SOCIALIZE?", 
                Arrays.asList("Yes, I love hanging out", "Yes, if it's with people I know", "No, I like being alone", "If I can avoid it, I will"),
                Arrays.asList(1, 2, 3, 4), "social"),
            new Question(null, "CHOOSE A QUOTE", 
                Arrays.asList("Always look on the bright side of life", "Worrying is as productive as chewing gum", "Life's a bitch, then you die", "Hard times reveal true friends"),
                Arrays.asList(1, 2, 3, 4), "outlook"),
            new Question(null, "ARE YOU IN CONTROL OF YOUR EMOTIONS?", 
                Arrays.asList("Yes, pretty much all of the time", "Not really, no", "I don't really have emotions", "Yes, I'd say so"),
                Arrays.asList(1, 2, 3, 4), "emotional"),
            new Question(null, "HOW DO YOU SPEND YOUR FREE TIME?", 
                Arrays.asList("Seeing friends and family", "Thinking about things", "I love to watch horror movies", "Listening to music"),
                Arrays.asList(1, 2, 3, 4), "lifestyle"),
            new Question(null, "CHOOSE ONE WISH", 
                Arrays.asList("To always be this happy", "To be able to stop worrying", "To be on my own more", "To at least feel content"),
                Arrays.asList(1, 2, 3, 4), "desires"),
            new Question(null, "DO YOU LOVE LIFE?", 
                Arrays.asList("Yes, I really do", "I do, but I wish it was easier", "No, not really", "I try, but it's a struggle for me"),
                Arrays.asList(1, 2, 3, 4), "outlook")
        );
        
        // Weekly Check-in Questions
        List<Question> weeklyCheckinQuestions = Arrays.asList(
            new Question(null, "HOW WOULD YOU RATE YOUR MOOD THIS WEEK?", 
                Arrays.asList("Great", "Good", "Okay", "Poor", "Terrible"),
                Arrays.asList(1, 2, 3, 4, 5), "weekly_checkin"),
            new Question(null, "HOW WELL HAVE YOU BEEN SLEEPING THIS WEEK?", 
                Arrays.asList("Very well", "Well", "Average", "Poorly", "Very poorly"),
                Arrays.asList(1, 2, 3, 4, 5), "weekly_checkin"),
            new Question(null, "HOW WOULD YOU RATE YOUR STRESS LEVELS THIS WEEK?", 
                Arrays.asList("Very low", "Low", "Moderate", "High", "Very high"),
                Arrays.asList(1, 2, 3, 4, 5), "weekly_checkin"),
            new Question(null, "HOW CONNECTED HAVE YOU FELT TO OTHERS THIS WEEK?", 
                Arrays.asList("Very connected", "Connected", "Somewhat connected", "Disconnected", "Very disconnected"),
                Arrays.asList(1, 2, 3, 4, 5), "weekly_checkin"),
            new Question(null, "HOW PRODUCTIVE HAVE YOU FELT THIS WEEK?", 
                Arrays.asList("Very productive", "Productive", "Somewhat productive", "Unproductive", "Very unproductive"),
                Arrays.asList(1, 2, 3, 4, 5), "weekly_checkin")
        );
        
        // Anxiety-focused Questions
        List<Question> anxietyQuestions = Arrays.asList(
            new Question(null, "HOW OFTEN DO YOU FEEL NERVOUS OR ANXIOUS?", 
                Arrays.asList("Rarely", "Occasionally", "Sometimes", "Often", "Almost always"),
                Arrays.asList(1, 2, 3, 4, 5), "anxiety_focused"),
            new Question(null, "DO YOU WORRY EXCESSIVELY ABOUT DIFFERENT THINGS?", 
                Arrays.asList("Rarely", "Occasionally", "Sometimes", "Often", "Almost always"),
                Arrays.asList(1, 2, 3, 4, 5), "anxiety_focused"),
            new Question(null, "DO YOU HAVE TROUBLE RELAXING?", 
                Arrays.asList("Rarely", "Occasionally", "Sometimes", "Often", "Almost always"),
                Arrays.asList(1, 2, 3, 4, 5), "anxiety_focused"),
            new Question(null, "DO YOU EXPERIENCE PHYSICAL SYMPTOMS WHEN ANXIOUS (RACING HEART, SWEATING, ETC.)?", 
                Arrays.asList("Rarely", "Occasionally", "Sometimes", "Often", "Almost always"),
                Arrays.asList(1, 2, 3, 4, 5), "anxiety_focused"),
            new Question(null, "DO YOU AVOID SITUATIONS THAT MAKE YOU ANXIOUS?", 
                Arrays.asList("Rarely", "Occasionally", "Sometimes", "Often", "Almost always"),
                Arrays.asList(1, 2, 3, 4, 5), "anxiety_focused")
        );
        
        // Depression-focused Questions
        List<Question> depressionQuestions = Arrays.asList(
            new Question(null, "HOW OFTEN DO YOU FEEL DOWN OR DEPRESSED?", 
                Arrays.asList("Rarely", "Occasionally", "Sometimes", "Often", "Almost always"),
                Arrays.asList(1, 2, 3, 4, 5), "depression_focused"),
            new Question(null, "DO YOU HAVE LITTLE INTEREST OR PLEASURE IN DOING THINGS?", 
                Arrays.asList("Rarely", "Occasionally", "Sometimes", "Often", "Almost always"),
                Arrays.asList(1, 2, 3, 4, 5), "depression_focused"),
            new Question(null, "DO YOU HAVE TROUBLE FALLING ASLEEP, STAYING ASLEEP, OR SLEEPING TOO MUCH?", 
                Arrays.asList("Rarely", "Occasionally", "Sometimes", "Often", "Almost always"),
                Arrays.asList(1, 2, 3, 4, 5), "depression_focused"),
            new Question(null, "DO YOU FEEL TIRED OR HAVE LITTLE ENERGY?", 
                Arrays.asList("Rarely", "Occasionally", "Sometimes", "Often", "Almost always"),
                Arrays.asList(1, 2, 3, 4, 5), "depression_focused"),
            new Question(null, "DO YOU FEEL BAD ABOUT YOURSELF OR THAT YOU ARE A FAILURE?", 
                Arrays.asList("Rarely", "Occasionally", "Sometimes", "Often", "Almost always"),
                Arrays.asList(1, 2, 3, 4, 5), "depression_focused")
        );
        
        // Daily Mood Check Questions
        List<Question> dailyMoodQuestions = Arrays.asList(
            new Question(null, "HOW WOULD YOU RATE YOUR MOOD TODAY?", 
                Arrays.asList("Great", "Good", "Okay", "Poor", "Terrible"),
                Arrays.asList(1, 2, 3, 4, 5), "daily_mood"),
            new Question(null, "WHAT'S YOUR ENERGY LEVEL TODAY?", 
                Arrays.asList("Very high", "High", "Moderate", "Low", "Very low"),
                Arrays.asList(1, 2, 3, 4, 5), "daily_mood"),
            new Question(null, "HOW WELL DID YOU SLEEP LAST NIGHT?", 
                Arrays.asList("Very well", "Well", "Average", "Poorly", "Very poorly"),
                Arrays.asList(1, 2, 3, 4, 5), "daily_mood")
        );
        
        // Save all questions
        questionRepository.saveAll(initialAssessmentQuestions);
        questionRepository.saveAll(weeklyCheckinQuestions);
        questionRepository.saveAll(anxietyQuestions);
        questionRepository.saveAll(depressionQuestions);
        questionRepository.saveAll(dailyMoodQuestions);
        
        System.out.println("Database seeded with quiz questions");
    }
}