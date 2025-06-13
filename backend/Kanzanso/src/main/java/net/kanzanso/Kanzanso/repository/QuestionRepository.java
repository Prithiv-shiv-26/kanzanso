package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByCategory(String category);
}