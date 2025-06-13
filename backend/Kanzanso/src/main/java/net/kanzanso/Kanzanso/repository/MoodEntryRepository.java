package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.MoodEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MoodEntryRepository extends MongoRepository<MoodEntry, String> {
    List<MoodEntry> findByUserIdOrderByDateDesc(String userId);
    List<MoodEntry> findByUserIdAndDateBetweenOrderByDateDesc(String userId, LocalDateTime start, LocalDateTime end);
    Optional<MoodEntry> findByUserIdAndDateBetween(String userId, LocalDateTime startOfDay, LocalDateTime endOfDay);
}
