package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.TodoItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoItemRepository extends MongoRepository<TodoItem, String> {
    List<TodoItem> findByUserId(String userId);
    List<TodoItem> findByUserIdAndCompleted(String userId, boolean completed);
    void deleteByUserId(String userId);
}