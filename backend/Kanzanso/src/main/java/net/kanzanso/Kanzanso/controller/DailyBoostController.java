package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.dto.DailyBoostStatsDTO;
import net.kanzanso.Kanzanso.dto.DailyChallengeDTO;
import net.kanzanso.Kanzanso.dto.InsightDTO;
import net.kanzanso.Kanzanso.service.DailyBoostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/daily-boost")
public class DailyBoostController extends BaseController {

    private final DailyBoostService dailyBoostService;

    @Autowired
    public DailyBoostController(DailyBoostService dailyBoostService) {
        this.dailyBoostService = dailyBoostService;
    }

    /**
     * Get daily challenges for the current user
     */
    @GetMapping("/challenges")
    public ResponseEntity<List<DailyChallengeDTO>> getChallenges(HttpServletRequest request) {
        String userId = extractUserIdFromToken(request);
        return ResponseEntity.ok(dailyBoostService.getDailyChallenges(userId));
    }

    /**
     * Get insights for the current user
     */
    @GetMapping("/insights")
    public ResponseEntity<List<InsightDTO>> getInsights(HttpServletRequest request) {
        String userId = extractUserIdFromToken(request);
        return ResponseEntity.ok(dailyBoostService.getInsights(userId));
    }

    /**
     * Get daily boost stats for the current user
     */
    @GetMapping("/stats")
    public ResponseEntity<DailyBoostStatsDTO> getStats(HttpServletRequest request) {
        String userId = extractUserIdFromToken(request);
        return ResponseEntity.ok(dailyBoostService.getStats(userId));
    }

    /**
     * Complete a challenge
     */
    @PostMapping("/complete/{challengeId}")
    public ResponseEntity<DailyChallengeDTO> completeChallenge(
            @PathVariable String challengeId,
            HttpServletRequest request) {
        String userId = extractUserIdFromToken(request);
        return ResponseEntity.ok(dailyBoostService.completeChallenge(userId, challengeId));
    }

    /**
     * Update challenge progress
     */
    @PostMapping("/progress")
    public ResponseEntity<DailyChallengeDTO> updateProgress(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        String userId = extractUserIdFromToken(request);
        String challengeId = (String) payload.get("challengeId");
        int progress = Integer.parseInt(payload.get("progress").toString());

        return ResponseEntity.ok(dailyBoostService.updateChallengeProgress(userId, challengeId, progress));
    }
}
