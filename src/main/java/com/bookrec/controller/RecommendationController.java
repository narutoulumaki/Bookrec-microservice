package com.bookrec.controller;

import com.bookrec.model.Book;
import com.bookrec.repository.UserRepository;
import com.bookrec.security.JwtUtil;
import com.bookrec.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;

    private UUID getUserIdFromToken(String token) {
        if (token.startsWith("Bearer ")) token = token.substring(7);
        String email = jwtUtil.extractUsername(token);
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    @GetMapping("/top")
    public List<Book> getRecommendations(@RequestHeader("Authorization") String token) {
        return recommendationService.getRecommendations(getUserIdFromToken(token));
    }
}
