package net.kanzanso.service.implementation;

import net.kanzanso.dto.QuestionDto;
import net.kanzanso.dto.QuizResultDto;
import net.kanzanso.dto.QuizSubmissionDto;
import net.kanzanso.exception.BadRequestException;
import net.kanzanso.exception.ResourceNotFoundException;
import net.kanzanso.mapper.QuestionMapper;
import net.kanzanso.mapper.QuizResultMapper;
import net.kanzanso.model.Question;
import net.kanzanso.model.QuizResult;
import net.kanzanso.repository.QuestionRepository;
import net.kanzanso.repository.QuizResultRepository;
import net.kanzanso.service.QuizService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuizServiceImpl implements QuizService {
    
    private final QuestionRepository questionRepository;
    private final QuizResultRepository quizResultRepository;
    private final QuestionMapper questionMapper;
    private final QuizResultMapper quizResultMapper;
    
    public QuizServiceImpl(
            QuestionRepository questionRepository,
            QuizResultRepository quizResultRepository,
            QuestionMapper questionMapper,
            QuizResultMapper quizResultMapper) {
        this.questionRepository = questionRepository;
        this.quizResultRepository = quizResultRepository;
        this.questionMapper = questionMapper;
        this.quizResultMapper = quizResultMapper;
    }
    
    @Override
    public QuestionDto createQuestion(QuestionDto questionDto) {
        Question question = questionMapper.toEntity(questionDto);
        Question savedQuestion = questionRepository.save(question);
        return questionMapper.toDto(savedQuestion);
    }
    
    @Override
    public QuestionDto getQuestionById(String id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id, "QUESTION_NOT_FOUND"));
        return questionMapper.toDto(question);
    }
    
    @Override
    public List<QuestionDto> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(questionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<QuestionDto> getQuestionsByQuizType(String quizType) {
        switch (quizType) {
            case "initial_assessment":
                // Return all general questions (excluding specific categories)
                return questionRepository.findAll().stream()
                        .filter(q -> !q.getCategory().equals("weekly_checkin") && 
                                    !q.getCategory().equals("anxiety_focused") && 
                                    !q.getCategory().equals("depression_focused") && 
                                    !q.getCategory().equals("daily_mood"))
                        .map(questionMapper::toDto)
                        .collect(Collectors.toList());
            case "weekly_checkin":
                return getQuestionsByCategory("weekly_checkin");
            case "anxiety_focused":
                return getQuestionsByCategory("anxiety_focused");
            case "depression_focused":
                return getQuestionsByCategory("depression_focused");
            case "daily_mood":
                return getQuestionsByCategory("daily_mood");
            default:
                // Default to initial assessment
                return getQuestionsByCategory("mood");
        }
    }
    
    @Override
    public List<QuestionDto> getQuestionsByCategory(String category) {
        return questionRepository.findByCategory(category).stream()
                .map(questionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public QuestionDto updateQuestion(String id, QuestionDto questionDto) {
        Question existingQuestion = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id, "QUESTION_NOT_FOUND"));
        
        existingQuestion.setText(questionDto.getText());
        existingQuestion.setOptions(questionDto.getOptions());
        existingQuestion.setScores(questionDto.getScores());
        existingQuestion.setCategory(questionDto.getCategory());
        
        Question updatedQuestion = questionRepository.save(existingQuestion);
        return questionMapper.toDto(updatedQuestion);
    }
    
    @Override
    public void deleteQuestion(String id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question not found with id: " + id, "QUESTION_NOT_FOUND");
        }
        questionRepository.deleteById(id);
    }
    
    @Override
    public QuizResultDto submitQuiz(QuizSubmissionDto quizSubmissionDto) {
        // Calculate scores for each category and total score
        Map<String, Integer> categoryScores = new HashMap<>();
        int totalScore = 0;
        
        for (Map.Entry<String, Integer> answer : quizSubmissionDto.getAnswers().entrySet()) {
            String questionId = answer.getKey();
            int selectedOptionIndex = answer.getValue();
            
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId, "QUESTION_NOT_FOUND"));
            
            // Ensure the selected option index is valid
            if (selectedOptionIndex < 0 || selectedOptionIndex >= question.getScores().size()) {
                throw new BadRequestException("Invalid option index for question: " + questionId, "INVALID_OPTION_INDEX");
            }
            
            // Get the score for the selected option
            int score = question.getScores().get(selectedOptionIndex);
            
            // Add to category score
            String category = question.getCategory();
            categoryScores.put(category, categoryScores.getOrDefault(category, 0) + score);
            
            // Add to total score
            totalScore += score;
        }
        
        // Generate result summary based on quiz type and total score
        String resultSummary = generateResultSummary(quizSubmissionDto.getQuizType(), totalScore);
        
        // Create and save the quiz result
        QuizResult quizResult = new QuizResult();
        quizResult.setUserId(quizSubmissionDto.getUserId());
        quizResult.setQuizType(quizSubmissionDto.getQuizType());
        quizResult.setCategoryScores(categoryScores);
        quizResult.setTotalScore(totalScore);
        quizResult.setResultSummary(resultSummary);
        quizResult.setCreatedAt(LocalDateTime.now());
        
        QuizResult savedResult = quizResultRepository.save(quizResult);
        return quizResultMapper.toDto(savedResult);
    }
    
    @Override
    public QuizResultDto getQuizResultById(String id) {
        QuizResult quizResult = quizResultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz result not found with id: " + id, "QUIZ_RESULT_NOT_FOUND"));
        return quizResultMapper.toDto(quizResult);
    }
    
    @Override
    public List<QuizResultDto> getQuizResultsByUserId(String userId) {
        return quizResultRepository.findByUserId(userId).stream()
                .map(quizResultMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<QuizResultDto> getLatestQuizResultsByUserId(String userId) {
        return quizResultRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(quizResultMapper::toDto)
                .collect(Collectors.toList());
    }
    
    private String generateResultSummary(String quizType, int totalScore) {
        // Generate different summaries based on quiz type
        switch (quizType) {
            case "initial_assessment":
                return generateInitialAssessmentSummary(totalScore);
            case "weekly_checkin":
                return generateWeeklyCheckinSummary(totalScore);
            case "anxiety_focused":
                return generateAnxietySummary(totalScore);
            case "depression_focused":
                return generateDepressionSummary(totalScore);
            case "daily_mood":
                return generateDailyMoodSummary(totalScore);
            default:
                return generateInitialAssessmentSummary(totalScore);
        }
    }
    
    private String generateInitialAssessmentSummary(int totalScore) {
        if (totalScore >= 10 && totalScore <= 16) {
            return "DISORDER FREE: You don't seem to be suffering from any symptoms, and overall you are balanced and happy. Remember that mental health issues affect a lot of people, so keep an eye on your friends and family to make sure they're well and happy.";
        } else if (totalScore >= 17 && totalScore <= 24) {
            return "ANXIETY: You are a serious worrier, and you fear that a panic attack could strike at any time. This holds you back from living your life to the full. Confiding in those around you and talking about your worries can help, and meditation and breathing exercises may calm your racing mind.";
        } else if (totalScore >= 25 && totalScore <= 32) {
            return "ANTISOCIAL: You prefer to be on your own and you struggle to develop relationships with others. You lack empathy and you don't exhibit any emotions. Getting to the root of this problem will help you to understand it and tackle it, so speak up.";
        } else {
            return "DEPRESSION: You are burdened by feelings of hopelessness and helplessness, and you aren't truly engaged in life. You deserve to be happy and healthy, and talking to a doctor could go a long way towards getting you to a more content place.";
        }
    }
    
    private String generateWeeklyCheckinSummary(int totalScore) {
        if (totalScore <= 10) {
            return "GREAT WEEK: You've had a great week with low stress levels. Keep up the good work!";
        } else if (totalScore <= 15) {
            return "GOOD WEEK: You've had a good week overall, with some minor stressors. Continue your self-care practices.";
        } else if (totalScore <= 20) {
            return "MODERATE WEEK: You've experienced moderate stress this week. Consider adding more relaxation activities.";
        } else {
            return "CHALLENGING WEEK: This week has been challenging for you. Focus on self-care and consider talking to someone about your feelings.";
        }
    }
    
    private String generateAnxietySummary(int totalScore) {
        if (totalScore <= 10) {
            return "MINIMAL ANXIETY: You're experiencing minimal anxiety symptoms. Continue your healthy coping strategies.";
        } else if (totalScore <= 15) {
            return "MILD ANXIETY: You're experiencing mild anxiety. Try incorporating breathing exercises and mindfulness.";
        } else if (totalScore <= 20) {
            return "MODERATE ANXIETY: You're experiencing moderate anxiety. Regular meditation and possibly talking to a counselor could help.";
        } else {
            return "SEVERE ANXIETY: You're experiencing significant anxiety symptoms. We recommend seeking professional support.";
        }
    }
    
    private String generateDepressionSummary(int totalScore) {
        if (totalScore <= 10) {
            return "MINIMAL DEPRESSION: You're showing minimal signs of depression. Maintain your positive activities.";
        } else if (totalScore <= 15) {
            return "MILD DEPRESSION: You're showing some signs of low mood. Try to increase physical activity and social connections.";
        } else if (totalScore <= 20) {
            return "MODERATE DEPRESSION: You're showing moderate signs of depression. Consider speaking with a mental health professional.";
        } else {
            return "SEVERE DEPRESSION: You're showing significant signs of depression. We strongly recommend seeking professional support.";
        }
    }
    
    private String generateDailyMoodSummary(int totalScore) {
        if (totalScore <= 5) {
            return "GREAT DAY: Today is going well for you! Enjoy the positive feelings.";
        } else if (totalScore <= 8) {
            return "GOOD DAY: You're having a good day with some minor challenges.";
        } else if (totalScore <= 11) {
            return "OKAY DAY: Your day has been okay, with some ups and downs.";
        } else {
            return "TOUGH DAY: Today has been challenging. Be kind to yourself and practice self-care.";
        }
    }
}