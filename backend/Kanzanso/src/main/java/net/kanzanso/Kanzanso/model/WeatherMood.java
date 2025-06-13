package net.kanzanso.Kanzanso.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "weather_moods")
public class WeatherMood {
    @Id
    private String id;
    private String weather;
    private String mood;
    private List<String> activities;

    public WeatherMood() {
    }

    public WeatherMood(String weather, String mood, List<String> activities) {
        this.weather = weather;
        this.mood = mood;
        this.activities = activities;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getWeather() {
        return weather;
    }

    public void setWeather(String weather) {
        this.weather = weather;
    }

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public List<String> getActivities() {
        return activities;
    }

    public void setActivities(List<String> activities) {
        this.activities = activities;
    }
}
