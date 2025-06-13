package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.GratitudeEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GratitudeEntryRepository extends MongoRepository<GratitudeEntry, String> {
    List<GratitudeEntry> findByUserIdOrderByDateDesc(String userId);
    List<GratitudeEntry> findByUserIdAndDateBetweenOrderByDateDesc(String userId, LocalDateTime start, LocalDateTime end);
    List<GratitudeEntry> findByUserIdAndTagsContainingOrderByDateDesc(String userId, String tag);
    long countByUserIdAndDateBetween(String userId, LocalDateTime start, LocalDateTime end);
}
