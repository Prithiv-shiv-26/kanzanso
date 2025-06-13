package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.Insight;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsightRepository extends MongoRepository<Insight, String> {
    List<Insight> findByUserIdAndIsUnlockedTrue(String userId);
    List<Insight> findByUserIdAndIsUnlockedFalse(String userId);
}
