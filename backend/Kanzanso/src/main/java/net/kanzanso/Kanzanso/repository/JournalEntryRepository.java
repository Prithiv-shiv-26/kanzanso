package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.JournalEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JournalEntryRepository extends MongoRepository<JournalEntry, String> {
    List<JournalEntry> findByUserId(String userId);
    List<JournalEntry> findByUserIdAndMood(String userId, String mood);
    List<JournalEntry> findByUserIdAndCreatedAtBetween(String userId, LocalDateTime start, LocalDateTime end);
    void deleteByUserId(String userId);
}