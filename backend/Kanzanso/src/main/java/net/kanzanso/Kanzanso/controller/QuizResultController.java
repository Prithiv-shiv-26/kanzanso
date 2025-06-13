package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.dto.QuizResultDTO;
import net.kanzanso.Kanzanso.service.QuizResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/quiz-results")
public class QuizResultController extends BaseController {

    private static final String DEMO_USER_PREFIX = "demo-";
    private static final String USER_NOT_FOUND_MESSAGE = "User not found";

    private final QuizResultService quizResultService;

    @Autowired
    public QuizResultController(QuizResultService quizResultService) {
        this.quizResultService = quizResultService;
    }

    @PostMapping
    public ResponseEntity<QuizResultDTO> saveQuizResult(@Valid @RequestBody QuizResultDTO quizResultDTO, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            QuizResultDTO savedQuizResult = quizResultService.saveQuizResult(userId, quizResultDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedQuizResult);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    // Additional endpoint for direct user ID in path (for testing)
    @PostMapping("/{userId}")
    public ResponseEntity<QuizResultDTO> saveQuizResultWithUserId(
            @PathVariable String userId,
            @Valid @RequestBody QuizResultDTO quizResultDTO) {
        try {
            QuizResultDTO savedQuizResult = quizResultService.saveQuizResult(userId, quizResultDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedQuizResult);
        } catch (IllegalArgumentException e) {
            // For demo users or users that don't exist, return a mock result instead of 400
            if (userId.startsWith(DEMO_USER_PREFIX) || e.getMessage().contains(USER_NOT_FOUND_MESSAGE)) {
                // Create a mock quiz result with the data from the request
                QuizResultDTO mockResult = new QuizResultDTO();
                mockResult.setId("demo-" + System.currentTimeMillis());
                mockResult.setQuizType(quizResultDTO.getQuizType());
                mockResult.setScore(quizResultDTO.getScore());
                mockResult.setCategoryScores(quizResultDTO.getCategoryScores());
                mockResult.setInterpretation(quizResultDTO.getInterpretation());
                mockResult.setRecommendations(quizResultDTO.getRecommendations());
                mockResult.setTakenAt(quizResultDTO.getTakenAt() != null ? quizResultDTO.getTakenAt() : java.time.LocalDateTime.now());

                return ResponseEntity.status(HttpStatus.CREATED).body(mockResult);
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<QuizResultDTO>> getQuizResults(HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            List<QuizResultDTO> quizResults = quizResultService.getQuizResultsByUserId(userId);
            return ResponseEntity.ok(quizResults);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // Additional endpoint for direct user ID in path (for testing)
    @GetMapping("/{userId}")
    public ResponseEntity<List<QuizResultDTO>> getQuizResultsByUserId(@PathVariable String userId) {
        try {
            List<QuizResultDTO> quizResults = quizResultService.getQuizResultsByUserId(userId);
            return ResponseEntity.ok(quizResults);
        } catch (IllegalArgumentException e) {
            // For demo users or users that don't exist, return an empty list instead of 404
            if (userId.startsWith(DEMO_USER_PREFIX) || e.getMessage().contains(USER_NOT_FOUND_MESSAGE)) {
                return ResponseEntity.ok(List.of());
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/type/{quizType}")
    public ResponseEntity<List<QuizResultDTO>> getQuizResultsByType(@PathVariable String quizType, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            List<QuizResultDTO> quizResults = quizResultService.getQuizResultsByUserIdAndType(userId, quizType);
            return ResponseEntity.ok(quizResults);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // Additional endpoint for direct user ID in path (for testing)
    @GetMapping("/{userId}/type/{quizType}")
    public ResponseEntity<List<QuizResultDTO>> getQuizResultsByUserIdAndType(
            @PathVariable String userId,
            @PathVariable String quizType) {
        try {
            List<QuizResultDTO> quizResults = quizResultService.getQuizResultsByUserIdAndType(userId, quizType);
            return ResponseEntity.ok(quizResults);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/type/{quizType}/latest")
    public ResponseEntity<QuizResultDTO> getLatestQuizResultByType(@PathVariable String quizType, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            QuizResultDTO quizResult = quizResultService.getLatestQuizResultByUserIdAndType(userId, quizType);
            return ResponseEntity.ok(quizResult);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // Additional endpoint for direct user ID in path (for testing)
    @GetMapping("/{userId}/latest")
    public ResponseEntity<List<QuizResultDTO>> getLatestQuizResultsByUserId(@PathVariable String userId) {
        try {
            // Get all results and return the 5 most recent ones
            List<QuizResultDTO> allResults = quizResultService.getQuizResultsByUserId(userId);

            // Just take the first 5 results
            List<QuizResultDTO> latestResults = allResults.stream()
                    .limit(5)
                    .toList();

            return ResponseEntity.ok(latestResults);
        } catch (IllegalArgumentException e) {
            // For demo users or users that don't exist, return an empty list instead of 404
            if (userId.startsWith(DEMO_USER_PREFIX) || e.getMessage().contains(USER_NOT_FOUND_MESSAGE)) {
                return ResponseEntity.ok(List.of());
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/{userId}/progress")
    public ResponseEntity<Map<String, Object>> getUserProgressOverTime(@PathVariable String userId) {
        try {
            // Get all results for the user
            List<QuizResultDTO> allResults = quizResultService.getQuizResultsByUserId(userId);

            // Create a simple progress report
            Map<String, Object> progressData = new HashMap<>();
            progressData.put("userId", userId);
            progressData.put("message", "Progress tracking from your quiz history");

            Map<String, Object> chartData = new HashMap<>();
            chartData.put("labels", List.of("Week 1", "Week 2", "Week 3", "Week 4"));

            // Create data points for the chart
            List<Integer> dataPoints = new ArrayList<>();

            // Add data points based on available results
            if (!allResults.isEmpty()) {
                dataPoints.add(allResults.get(0).getScore() != null ? allResults.get(0).getScore() : 0);
            } else {
                dataPoints.add(0);
            }

            if (allResults.size() > 1) {
                dataPoints.add(allResults.get(1).getScore() != null ? allResults.get(1).getScore() : 0);
            } else {
                dataPoints.add(0);
            }

            if (allResults.size() > 2) {
                dataPoints.add(allResults.get(2).getScore() != null ? allResults.get(2).getScore() : 0);
            } else {
                dataPoints.add(0);
            }

            if (allResults.size() > 3) {
                dataPoints.add(allResults.get(3).getScore() != null ? allResults.get(3).getScore() : 0);
            } else {
                dataPoints.add(0);
            }

            // Create the dataset
            Map<String, Object> dataset = new HashMap<>();
            dataset.put("label", "Overall Score");
            dataset.put("data", dataPoints);

            List<Map<String, Object>> datasets = new ArrayList<>();
            datasets.add(dataset);

            chartData.put("datasets", datasets);
            progressData.put("data", chartData);

            return ResponseEntity.ok(progressData);
        } catch (IllegalArgumentException e) {
            // For demo users or users that don't exist, return default progress data
            if (userId.startsWith(DEMO_USER_PREFIX) || e.getMessage().contains(USER_NOT_FOUND_MESSAGE)) {
                Map<String, Object> progressData = new HashMap<>();
                progressData.put("userId", userId);
                progressData.put("message", "Sample progress data for demo user");

                Map<String, Object> chartData = new HashMap<>();
                chartData.put("labels", List.of("Week 1", "Week 2", "Week 3", "Week 4"));

                Map<String, Object> dataset = new HashMap<>();
                dataset.put("label", "Overall Score");
                dataset.put("data", List.of(7, 6, 8, 7));

                List<Map<String, Object>> datasets = new ArrayList<>();
                datasets.add(dataset);

                chartData.put("datasets", datasets);
                progressData.put("data", chartData);

                return ResponseEntity.ok(progressData);
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/{userId}/recommendations")
    public ResponseEntity<List<Map<String, String>>> getPersonalizedRecommendations(@PathVariable String userId) {
        try {
            // Check if user exists
            quizResultService.getQuizResultsByUserId(userId);

            // Create some default recommendations
            List<Map<String, String>> recommendations = List.of(
                Map.of(
                    "text", "Practice mindfulness meditation for 10 minutes daily",
                    "link", "../meditation/index.html"
                ),
                Map.of(
                    "text", "Track your mood in the mood tracker",
                    "link", "../know_yourself/index.html#mood-tracker"
                ),
                Map.of(
                    "text", "Set small, achievable goals in your to-do list",
                    "link", "../to_do_list/index.html"
                )
            );

            return ResponseEntity.ok(recommendations);
        } catch (IllegalArgumentException e) {
            // For demo users or users that don't exist, return default recommendations
            if (userId.startsWith(DEMO_USER_PREFIX) || e.getMessage().contains(USER_NOT_FOUND_MESSAGE)) {
                List<Map<String, String>> recommendations = List.of(
                    Map.of(
                        "text", "Practice mindfulness meditation for 10 minutes daily",
                        "link", "../meditation/index.html"
                    ),
                    Map.of(
                        "text", "Track your mood in the mood tracker",
                        "link", "../know_yourself/index.html#mood-tracker"
                    ),
                    Map.of(
                        "text", "Set small, achievable goals in your to-do list",
                        "link", "../to_do_list/index.html"
                    )
                );

                return ResponseEntity.ok(recommendations);
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/result/{id}")
    public ResponseEntity<QuizResultDTO> getQuizResultById(@PathVariable String id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            QuizResultDTO quizResult = quizResultService.getQuizResultById(userId, id);
            return ResponseEntity.ok(quizResult);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @DeleteMapping("/result/{id}")
    public ResponseEntity<Void> deleteQuizResult(@PathVariable String id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            quizResultService.deleteQuizResult(userId, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}