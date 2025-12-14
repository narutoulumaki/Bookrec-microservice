package com.bookrec.repository;

import com.bookrec.model.Interaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface InteractionRepository extends JpaRepository<Interaction, UUID> {
    List<Interaction> findByUserId(UUID userId);

    @Query("SELECT b.genre FROM Interaction i JOIN Book b ON i.bookId = b.id WHERE i.userId = :userId GROUP BY b.genre ORDER BY COUNT(b.genre) DESC")
    List<String> findTopGenresByUserId(@Param("userId") UUID userId);
}
