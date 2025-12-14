package com.bookrec.service;

import com.bookrec.model.Book;
import com.bookrec.repository.BookRepository;
import com.bookrec.repository.InteractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RecommendationService {

    @Autowired
    private InteractionRepository interactionRepository;

    @Autowired
    private BookRepository bookRepository;

    public List<Book> getRecommendations(UUID userId) {
        // Step 1: Find User's favorite genres
        List<String> topGenres = interactionRepository.findTopGenresByUserId(userId);
        
        if (topGenres.isEmpty()) {
            // Fallback: Return top rated books if no history
            // In a real app we'd have a specific query for this, but for now just all
            return bookRepository.findAll().stream().limit(10).toList();
        }

        // Step 2: Find books in those genres
        List<Book> recommendations = new ArrayList<>();
        for (String genre : topGenres) {
            recommendations.addAll(bookRepository.findByGenre(genre));
            if (recommendations.size() > 10) break; // Limit to 10
        }
        
        return recommendations;
    }
}
