package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.WeatherMoodDTO;
import net.kanzanso.Kanzanso.model.WeatherMood;
import net.kanzanso.Kanzanso.repository.WeatherMoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WeatherMoodService {

    private final WeatherMoodRepository weatherMoodRepository;

    @Autowired
    public WeatherMoodService(WeatherMoodRepository weatherMoodRepository) {
        this.weatherMoodRepository = weatherMoodRepository;
    }

    public List<WeatherMoodDTO> getAllWeatherMoods() {
        return weatherMoodRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public WeatherMoodDTO getWeatherMoodById(String id) {
        return weatherMoodRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Weather mood not found with id: " + id));
    }

    public WeatherMoodDTO getWeatherMoodByWeather(String weather) {
        // Normalize the weather string by removing day/night suffix
        String normalizedWeather = weather.replace("_day", "").replace("_night", "");
        
        // Try to find an exact match
        Optional<WeatherMood> exactMatch = weatherMoodRepository.findByWeather(normalizedWeather);
        if (exactMatch.isPresent()) {
            return convertToDTO(exactMatch.get());
        }
        
        // Try to find a match with spaces instead of underscores
        String formattedWeather = normalizedWeather.replace("_", " ");
        Optional<WeatherMood> formattedMatch = weatherMoodRepository.findByWeather(formattedWeather);
        if (formattedMatch.isPresent()) {
            return convertToDTO(formattedMatch.get());
        }
        
        // Return default if no match found
        return weatherMoodRepository.findByWeather("default")
                .map(this::convertToDTO)
                .orElseThrow(() -> new IllegalArgumentException("No default weather mood found"));
    }

    public WeatherMoodDTO createWeatherMood(WeatherMoodDTO weatherMoodDTO) {
        WeatherMood weatherMood = convertToEntity(weatherMoodDTO);
        WeatherMood savedWeatherMood = weatherMoodRepository.save(weatherMood);
        return convertToDTO(savedWeatherMood);
    }

    public WeatherMoodDTO updateWeatherMood(String id, WeatherMoodDTO weatherMoodDTO) {
        Optional<WeatherMood> existingWeatherMood = weatherMoodRepository.findById(id);
        if (existingWeatherMood.isPresent()) {
            WeatherMood weatherMood = existingWeatherMood.get();
            weatherMood.setWeather(weatherMoodDTO.getWeather());
            weatherMood.setMood(weatherMoodDTO.getMood());
            weatherMood.setActivities(weatherMoodDTO.getActivities());
            
            WeatherMood updatedWeatherMood = weatherMoodRepository.save(weatherMood);
            return convertToDTO(updatedWeatherMood);
        } else {
            throw new IllegalArgumentException("Weather mood not found with id: " + id);
        }
    }

    public void deleteWeatherMood(String id) {
        if (weatherMoodRepository.existsById(id)) {
            weatherMoodRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Weather mood not found with id: " + id);
        }
    }

    // Helper methods to convert between DTO and Entity
    private WeatherMoodDTO convertToDTO(WeatherMood weatherMood) {
        return new WeatherMoodDTO(
                weatherMood.getId(),
                weatherMood.getWeather(),
                weatherMood.getMood(),
                weatherMood.getActivities()
        );
    }

    private WeatherMood convertToEntity(WeatherMoodDTO weatherMoodDTO) {
        WeatherMood weatherMood = new WeatherMood();
        weatherMood.setId(weatherMoodDTO.getId());
        weatherMood.setWeather(weatherMoodDTO.getWeather());
        weatherMood.setMood(weatherMoodDTO.getMood());
        weatherMood.setActivities(weatherMoodDTO.getActivities());
        return weatherMood;
    }
}
