package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.dto.FavoriteQuoteDTO;
import net.kanzanso.Kanzanso.service.FavoriteQuoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/favorite-quotes")
public class FavoriteQuoteController extends BaseController {

    private final FavoriteQuoteService favoriteQuoteService;

    @Autowired
    public FavoriteQuoteController(FavoriteQuoteService favoriteQuoteService) {
        this.favoriteQuoteService = favoriteQuoteService;
    }

    @GetMapping
    public ResponseEntity<List<FavoriteQuoteDTO>> getFavoriteQuotesByUser(@RequestParam String userId) {
        return ResponseEntity.ok(favoriteQuoteService.getFavoriteQuotesByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FavoriteQuoteDTO> getFavoriteQuoteById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(favoriteQuoteService.getFavoriteQuoteById(id));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> isFavorite(@RequestParam String userId, @RequestParam String quoteId) {
        return ResponseEntity.ok(favoriteQuoteService.isFavorite(userId, quoteId));
    }

    @PostMapping
    public ResponseEntity<FavoriteQuoteDTO> addFavoriteQuote(@RequestBody FavoriteQuoteDTO favoriteQuoteDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(favoriteQuoteService.addFavoriteQuote(favoriteQuoteDTO));
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFavoriteQuote(@RequestParam String userId, @RequestParam String quoteId) {
        try {
            favoriteQuoteService.removeFavoriteQuote(userId, quoteId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFavoriteQuoteById(@PathVariable String id) {
        try {
            favoriteQuoteService.removeFavoriteQuoteById(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}
