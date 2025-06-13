package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.DailyChallenge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DailyChallengeRepository extends MongoRepository<DailyChallenge, String> {
    List<DailyChallenge> findByUserId(String userId);
    List<DailyChallenge> findByUserIdAndCompletedFalseAndExpiresAtAfter(String userId, LocalDateTime now);
    List<DailyChallenge> findByUserIdAndCompletedTrue(String userId);
    List<DailyChallenge> findByUserIdAndCompletedTrueAndCompletedAtAfter(String userId, LocalDateTime startOfDay);
}
