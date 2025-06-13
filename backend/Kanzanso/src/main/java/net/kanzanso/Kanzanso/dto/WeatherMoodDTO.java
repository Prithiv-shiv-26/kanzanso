package net.kanzanso.Kanzanso.dto;

import java.util.List;

public class WeatherMoodDTO {
    private String id;
    private String weather;
    private String mood;
    private List<String> activities;

    public WeatherMoodDTO() {
    }

    public WeatherMoodDTO(String id, String weather, String mood, List<String> activities) {
        this.id = id;
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
