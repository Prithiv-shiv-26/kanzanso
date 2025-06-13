package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.FavoriteQuote;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteQuoteRepository extends MongoRepository<FavoriteQuote, String> {
    List<FavoriteQuote> findByUserIdOrderByDateAddedDesc(String userId);
    Optional<FavoriteQuote> findByUserIdAndQuoteId(String userId, String quoteId);
    void deleteByUserIdAndQuoteId(String userId, String quoteId);
}
