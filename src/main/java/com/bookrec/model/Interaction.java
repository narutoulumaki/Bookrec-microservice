package com.bookrec.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Data;

@Entity
@Table(name = "interactions")
@Data
public class Interaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID userId;
    private UUID bookId;
    
    private Boolean liked; // True if liked
    private Integer rating; // 1-5 stars, nullable
    private String remarks; // Optional comment
    
    private LocalDateTime timestamp = LocalDateTime.now();
}
