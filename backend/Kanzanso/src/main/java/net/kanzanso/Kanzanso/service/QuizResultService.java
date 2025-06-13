package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.QuizResultDTO;
import net.kanzanso.Kanzanso.model.QuizResult;
import net.kanzanso.Kanzanso.model.User;
import net.kanzanso.Kanzanso.repository.QuizResultRepository;
import net.kanzanso.Kanzanso.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizResultService {

    private final QuizResultRepository quizResultRepository;
    private final UserRepository userRepository;

    @Autowired
    public QuizResultService(QuizResultRepository quizResultRepository, UserRepository userRepository) {
        this.quizResultRepository = quizResultRepository;
        this.userRepository = userRepository;
    }

    public QuizResultDTO saveQuizResult(String userId, QuizResultDTO quizResultDTO) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Create new quiz result
        QuizResult quizResult = QuizResult.builder()
                .quizType(quizResultDTO.getQuizType())
                .score(quizResultDTO.getScore())
                .categoryScores(quizResultDTO.getCategoryScores())
                .interpretation(quizResultDTO.getInterpretation())
                .recommendations(quizResultDTO.getRecommendations())
                .takenAt(LocalDateTime.now())
                .userId(userId)
                .build();

        QuizResult savedQuizResult = quizResultRepository.save(quizResult);

        // Update user's quizResultIds list
        user.getQuizResultIds().add(savedQuizResult.getId());
        userRepository.save(user);

        return convertToDTO(savedQuizResult);
    }

    public List<QuizResultDTO> getQuizResultsByUserId(String userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        return quizResultRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<QuizResultDTO> getQuizResultsByUserIdAndType(String userId, String quizType) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        return quizResultRepository.findByUserIdAndQuizType(userId, quizType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public QuizResultDTO getQuizResultById(String userId, String quizResultId) {
        QuizResult quizResult = quizResultRepository.findById(quizResultId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz result not found"));

        // Verify the quiz result belongs to the user
        if (!quizResult.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Quiz result does not belong to the user");
        }

        return convertToDTO(quizResult);
    }

    public QuizResultDTO getLatestQuizResultByUserIdAndType(String userId, String quizType) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        List<QuizResult> results = quizResultRepository.findByUserIdAndQuizType(userId, quizType);
        
        if (results.isEmpty()) {
            throw new IllegalArgumentException("No quiz results found for this type");
        }
        
        // Find the most recent result
        QuizResult latestResult = results.stream()
                .max((r1, r2) -> r1.getTakenAt().compareTo(r2.getTakenAt()))
                .orElseThrow();
                
        return convertToDTO(latestResult);
    }

    public void deleteQuizResult(String userId, String quizResultId) {
        QuizResult quizResult = quizResultRepository.findById(quizResultId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz result not found"));

        // Verify the quiz result belongs to the user
        if (!quizResult.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Quiz result does not belong to the user");
        }

        // Remove the quiz result ID from the user's quizResultIds list
        User user = userRepository.findById(userId).orElseThrow();
        user.getQuizResultIds().remove(quizResultId);
        userRepository.save(user);

        // Delete the quiz result
        quizResultRepository.deleteById(quizResultId);
    }

    // Helper method to convert QuizResult to QuizResultDTO
    private QuizResultDTO convertToDTO(QuizResult quizResult) {
        return QuizResultDTO.builder()
                .id(quizResult.getId())
                .quizType(quizResult.getQuizType())
                .score(quizResult.getScore())
                .categoryScores(quizResult.getCategoryScores())
                .interpretation(quizResult.getInterpretation())
                .recommendations(quizResult.getRecommendations())
                .takenAt(quizResult.getTakenAt())
                .build();
    }
}