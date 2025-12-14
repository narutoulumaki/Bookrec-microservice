package com.bookrec.controller;

import com.bookrec.model.Interaction;
import com.bookrec.model.User;
import com.bookrec.repository.UserRepository;
import com.bookrec.security.JwtUtil;
import com.bookrec.service.InteractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/interactions")
public class InteractionController {

    @Autowired
    private InteractionService interactionService;

    @Autowired
    private JwtUtil jwtUtil; // Used to get User ID from Token
    
    @Autowired
    private UserRepository userRepository;

    private UUID getUserIdFromToken(String token) {
        if (token.startsWith("Bearer ")) token = token.substring(7);
        String email = jwtUtil.extractUsername(token);
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    @PostMapping("/add")
    public Interaction addInteraction(@RequestHeader("Authorization") String token, @RequestBody Interaction interaction) {
        interaction.setUserId(getUserIdFromToken(token));
        return interactionService.saveInteraction(interaction);
    }

    @GetMapping("/history")
    public List<Interaction> getHistory(@RequestHeader("Authorization") String token) {
        return interactionService.getUserHistory(getUserIdFromToken(token));
    }
}
