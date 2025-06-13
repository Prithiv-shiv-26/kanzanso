package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.Streak;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StreakRepository extends MongoRepository<Streak, String> {
    List<Streak> findByUserId(String userId);
    List<Streak> findByUserIdAndType(String userId, String type);
    void deleteByUserId(String userId);
}