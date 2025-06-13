package net.kanzanso.Kanzanso.dto;

public class GratitudeStatsDTO {
    private long totalEntries;
    private int currentStreak;
    private long monthlyEntries;

    public GratitudeStatsDTO() {
    }

    public GratitudeStatsDTO(long totalEntries, int currentStreak, long monthlyEntries) {
        this.totalEntries = totalEntries;
        this.currentStreak = currentStreak;
        this.monthlyEntries = monthlyEntries;
    }

    public long getTotalEntries() {
        return totalEntries;
    }

    public void setTotalEntries(long totalEntries) {
        this.totalEntries = totalEntries;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public long getMonthlyEntries() {
        return monthlyEntries;
    }

    public void setMonthlyEntries(long monthlyEntries) {
        this.monthlyEntries = monthlyEntries;
    }
}
