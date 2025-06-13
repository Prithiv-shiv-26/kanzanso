package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.Quote;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuoteRepository extends MongoRepository<Quote, String> {
    List<Quote> findByCategory(String category);
}
