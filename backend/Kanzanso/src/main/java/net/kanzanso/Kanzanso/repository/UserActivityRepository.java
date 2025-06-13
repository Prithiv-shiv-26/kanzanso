package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.UserActivity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivityRepository extends MongoRepository<UserActivity, String> {
    // Find the first UserActivity by userId
    @Query(value = "{ 'userId': ?0 }", sort = "{ 'updatedAt': -1 }")
    Optional<UserActivity> findByUserId(String userId);

    // Find all UserActivity records by userId
    List<UserActivity> findAllByUserId(String userId);
}
