package com.bookrec.service;

import com.bookrec.model.Interaction;
import com.bookrec.repository.InteractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class InteractionService {

    @Autowired
    private InteractionRepository interactionRepository;

    public Interaction saveInteraction(Interaction interaction) {
        return interactionRepository.save(interaction);
    }

    public List<Interaction> getUserHistory(UUID userId) {
        return interactionRepository.findByUserId(userId);
    }
    
    public List<String> getTopGenres(UUID userId) {
        return interactionRepository.findTopGenresByUserId(userId);
    }
}
