package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.dto.WeatherMoodDTO;
import net.kanzanso.Kanzanso.service.WeatherMoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/weather-moods")
public class WeatherMoodController {

    private final WeatherMoodService weatherMoodService;

    @Autowired
    public WeatherMoodController(WeatherMoodService weatherMoodService) {
        this.weatherMoodService = weatherMoodService;
    }

    @GetMapping
    public ResponseEntity<List<WeatherMoodDTO>> getAllWeatherMoods() {
        return ResponseEntity.ok(weatherMoodService.getAllWeatherMoods());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeatherMoodDTO> getWeatherMoodById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(weatherMoodService.getWeatherMoodById(id));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/weather/{weather}")
    public ResponseEntity<WeatherMoodDTO> getWeatherMoodByWeather(@PathVariable String weather) {
        try {
            return ResponseEntity.ok(weatherMoodService.getWeatherMoodByWeather(weather));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<WeatherMoodDTO> createWeatherMood(@RequestBody WeatherMoodDTO weatherMoodDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(weatherMoodService.createWeatherMood(weatherMoodDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WeatherMoodDTO> updateWeatherMood(@PathVariable String id, @RequestBody WeatherMoodDTO weatherMoodDTO) {
        try {
            return ResponseEntity.ok(weatherMoodService.updateWeatherMood(id, weatherMoodDTO));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWeatherMood(@PathVariable String id) {
        try {
            weatherMoodService.deleteWeatherMood(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}
