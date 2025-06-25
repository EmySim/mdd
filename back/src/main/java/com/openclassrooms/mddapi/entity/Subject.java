package com.openclassrooms.mddapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Entité Subject - Correspondance exacte avec la table subjects.
 *
 * **DB-FIRST** : Structure basée sur la table MySQL existante.
 *
 * Table: subjects
 * - id: bigint AUTO_INCREMENT PRIMARY KEY
 * - name: varchar(100) NOT NULL UNIQUE
 * - description: text NULL
 * - created_at: timestamp DEFAULT CURRENT_TIMESTAMP
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    /**
     * ID auto-généré - Correspondance avec colonne id.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Nom du sujet - Correspondance avec colonne name.
     * Contrainte d'unicité gérée par la DB.
     */
    @NotBlank(message = "Subject name is mandatory")
    @Size(max = 100, message = "Subject name must not exceed 100 characters")
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    /**
     * Description du sujet - Correspondance avec colonne description.
     * Optionnelle (nullable = true).
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Date de création - Correspondance avec colonne created_at.
     * Auto-générée par Hibernate.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}