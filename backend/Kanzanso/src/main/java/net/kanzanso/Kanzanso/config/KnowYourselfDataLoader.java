package net.kanzanso.Kanzanso.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.kanzanso.Kanzanso.model.Quote;
import net.kanzanso.Kanzanso.model.WeatherMood;
import net.kanzanso.Kanzanso.repository.QuoteRepository;
import net.kanzanso.Kanzanso.repository.WeatherMoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Configuration
public class KnowYourselfDataLoader {

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private WeatherMoodRepository weatherMoodRepository;

    @Bean
    CommandLineRunner loadKnowYourselfData() {
        return args -> {
            // Load quotes if none exist
            if (quoteRepository.count() == 0) {
                loadQuotes();
            }

            // Load weather moods if none exist
            if (weatherMoodRepository.count() == 0) {
                loadWeatherMoods();
            }
        };
    }

    private void loadQuotes() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = new ClassPathResource("data/quotes.json").getInputStream();
            List<Map<String, String>> quotesData = mapper.readValue(is, new TypeReference<List<Map<String, String>>>() {});

            for (Map<String, String> quoteData : quotesData) {
                Quote quote = new Quote();
                quote.setText(quoteData.get("text"));
                quote.setAuthor(quoteData.get("author"));
                quote.setCategory(quoteData.getOrDefault("category", null));
                quoteRepository.save(quote);
            }

            System.out.println("Loaded " + quotesData.size() + " quotes");
        } catch (IOException e) {
            System.err.println("Error loading quotes: " + e.getMessage());
        }
    }

    private void loadWeatherMoods() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = new ClassPathResource("data/weather_moods.json").getInputStream();
            List<Map<String, Object>> weatherMoodsData = mapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {});

            for (Map<String, Object> weatherMoodData : weatherMoodsData) {
                WeatherMood weatherMood = new WeatherMood();
                weatherMood.setWeather((String) weatherMoodData.get("weather"));
                weatherMood.setMood((String) weatherMoodData.get("mood"));
                
                @SuppressWarnings("unchecked")
                List<String> activities = (List<String>) weatherMoodData.get("activities");
                weatherMood.setActivities(activities);
                
                weatherMoodRepository.save(weatherMood);
            }

            System.out.println("Loaded " + weatherMoodsData.size() + " weather moods");
        } catch (IOException e) {
            System.err.println("Error loading weather moods: " + e.getMessage());
        }
    }
}
