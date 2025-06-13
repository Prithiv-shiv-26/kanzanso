package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.QuoteDTO;
import net.kanzanso.Kanzanso.model.Quote;
import net.kanzanso.Kanzanso.repository.QuoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private static final String QUOTABLE_API_URL = "https://api.quotable.io";

    @Autowired
    public QuoteService(QuoteRepository quoteRepository) {
        this.quoteRepository = quoteRepository;
    }

    public List<QuoteDTO> getAllQuotes() {
        return quoteRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public QuoteDTO getQuoteById(String id) {
        return quoteRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Quote not found with id: " + id));
    }

    public QuoteDTO getRandomQuote() {
        // Try to get a quote from the external API first
        try {
            return getRandomQuoteFromExternalApi();
        } catch (Exception e) {
            // If external API fails, fall back to local database
            System.err.println("Error fetching quote from external API: " + e.getMessage());
            return getRandomQuoteFromDatabase();
        }
    }

    private QuoteDTO getRandomQuoteFromDatabase() {
        List<Quote> quotes = quoteRepository.findAll();
        if (quotes.isEmpty()) {
            throw new IllegalStateException("No quotes available in the database");
        }

        Random random = new Random();
        Quote randomQuote = quotes.get(random.nextInt(quotes.size()));
        return convertToDTO(randomQuote);
    }

    @SuppressWarnings("unchecked")
    public QuoteDTO getRandomQuoteFromExternalApi() {
        try {
            // Call the Quotable API to get a random quote using direct URL connection
            URL url = new URL(QUOTABLE_API_URL + "/random");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Content-Type", "application/json");

            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String inputLine;
                StringBuilder response = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();

                // Parse JSON response
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> quoteData = mapper.readValue(response.toString(), Map.class);

                QuoteDTO quoteDTO = new QuoteDTO();
                quoteDTO.setId((String) quoteData.get("_id"));
                quoteDTO.setText((String) quoteData.get("content"));
                quoteDTO.setAuthor((String) quoteData.get("author"));

                // Set category if available
                if (quoteData.containsKey("tags")) {
                    List<String> tags = (List<String>) quoteData.get("tags");
                    if (tags != null && !tags.isEmpty()) {
                        quoteDTO.setCategory(tags.get(0));
                    }
                }

                return quoteDTO;
            } else {
                throw new IllegalStateException("Failed to fetch quote from external API. Response code: " + responseCode);
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to fetch quote from external API: " + e.getMessage(), e);
        }
    }

    public List<QuoteDTO> getQuotesByCategory(String category) {
        return quoteRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public QuoteDTO createQuote(QuoteDTO quoteDTO) {
        Quote quote = convertToEntity(quoteDTO);
        Quote savedQuote = quoteRepository.save(quote);
        return convertToDTO(savedQuote);
    }

    public QuoteDTO updateQuote(String id, QuoteDTO quoteDTO) {
        Optional<Quote> existingQuote = quoteRepository.findById(id);
        if (existingQuote.isPresent()) {
            Quote quote = existingQuote.get();
            quote.setText(quoteDTO.getText());
            quote.setAuthor(quoteDTO.getAuthor());
            quote.setCategory(quoteDTO.getCategory());

            Quote updatedQuote = quoteRepository.save(quote);
            return convertToDTO(updatedQuote);
        } else {
            throw new IllegalArgumentException("Quote not found with id: " + id);
        }
    }

    public void deleteQuote(String id) {
        if (quoteRepository.existsById(id)) {
            quoteRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Quote not found with id: " + id);
        }
    }

    // Helper methods to convert between DTO and Entity
    private QuoteDTO convertToDTO(Quote quote) {
        return new QuoteDTO(
                quote.getId(),
                quote.getText(),
                quote.getAuthor(),
                quote.getCategory()
        );
    }

    private Quote convertToEntity(QuoteDTO quoteDTO) {
        Quote quote = new Quote();
        quote.setId(quoteDTO.getId());
        quote.setText(quoteDTO.getText());
        quote.setAuthor(quoteDTO.getAuthor());
        quote.setCategory(quoteDTO.getCategory());
        return quote;
    }
}
