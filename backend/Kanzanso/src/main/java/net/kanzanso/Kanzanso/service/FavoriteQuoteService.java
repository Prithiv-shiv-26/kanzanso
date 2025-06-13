package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.FavoriteQuoteDTO;
import net.kanzanso.Kanzanso.model.FavoriteQuote;
import net.kanzanso.Kanzanso.repository.FavoriteQuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoriteQuoteService {

    private final FavoriteQuoteRepository favoriteQuoteRepository;

    @Autowired
    public FavoriteQuoteService(FavoriteQuoteRepository favoriteQuoteRepository) {
        this.favoriteQuoteRepository = favoriteQuoteRepository;
    }

    public List<FavoriteQuoteDTO> getFavoriteQuotesByUser(String userId) {
        return favoriteQuoteRepository.findByUserIdOrderByDateAddedDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public FavoriteQuoteDTO getFavoriteQuoteById(String id) {
        return favoriteQuoteRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Favorite quote not found with id: " + id));
    }

    public boolean isFavorite(String userId, String quoteId) {
        return favoriteQuoteRepository.findByUserIdAndQuoteId(userId, quoteId).isPresent();
    }

    public FavoriteQuoteDTO addFavoriteQuote(FavoriteQuoteDTO favoriteQuoteDTO) {
        // Check if already favorited
        Optional<FavoriteQuote> existingFavorite = favoriteQuoteRepository.findByUserIdAndQuoteId(
                favoriteQuoteDTO.getUserId(), favoriteQuoteDTO.getQuoteId());
        
        if (existingFavorite.isPresent()) {
            return convertToDTO(existingFavorite.get());
        }
        
        // Add new favorite
        FavoriteQuote favoriteQuote = convertToEntity(favoriteQuoteDTO);
        if (favoriteQuote.getDateAdded() == null) {
            favoriteQuote.setDateAdded(LocalDateTime.now());
        }
        
        FavoriteQuote savedFavorite = favoriteQuoteRepository.save(favoriteQuote);
        return convertToDTO(savedFavorite);
    }

    public void removeFavoriteQuote(String userId, String quoteId) {
        Optional<FavoriteQuote> existingFavorite = favoriteQuoteRepository.findByUserIdAndQuoteId(userId, quoteId);
        if (existingFavorite.isPresent()) {
            favoriteQuoteRepository.deleteById(existingFavorite.get().getId());
        } else {
            throw new IllegalArgumentException("Favorite quote not found for user: " + userId + " and quote: " + quoteId);
        }
    }

    public void removeFavoriteQuoteById(String id) {
        if (favoriteQuoteRepository.existsById(id)) {
            favoriteQuoteRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Favorite quote not found with id: " + id);
        }
    }

    // Helper methods to convert between DTO and Entity
    private FavoriteQuoteDTO convertToDTO(FavoriteQuote favoriteQuote) {
        return new FavoriteQuoteDTO(
                favoriteQuote.getId(),
                favoriteQuote.getUserId(),
                favoriteQuote.getQuoteId(),
                favoriteQuote.getText(),
                favoriteQuote.getAuthor(),
                favoriteQuote.getCategory(),
                favoriteQuote.getDateAdded()
        );
    }

    private FavoriteQuote convertToEntity(FavoriteQuoteDTO favoriteQuoteDTO) {
        FavoriteQuote favoriteQuote = new FavoriteQuote();
        favoriteQuote.setId(favoriteQuoteDTO.getId());
        favoriteQuote.setUserId(favoriteQuoteDTO.getUserId());
        favoriteQuote.setQuoteId(favoriteQuoteDTO.getQuoteId());
        favoriteQuote.setText(favoriteQuoteDTO.getText());
        favoriteQuote.setAuthor(favoriteQuoteDTO.getAuthor());
        favoriteQuote.setCategory(favoriteQuoteDTO.getCategory());
        favoriteQuote.setDateAdded(favoriteQuoteDTO.getDateAdded());
        return favoriteQuote;
    }
}
