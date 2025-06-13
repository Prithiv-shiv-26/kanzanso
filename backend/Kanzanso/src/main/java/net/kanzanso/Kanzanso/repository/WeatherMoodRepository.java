package net.kanzanso.Kanzanso.repository;

import net.kanzanso.Kanzanso.model.WeatherMood;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WeatherMoodRepository extends MongoRepository<WeatherMood, String> {
    Optional<WeatherMood> findByWeather(String weather);
}
