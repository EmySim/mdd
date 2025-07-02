package com.openclassrooms.mddapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité Subject (Sujet/Thème) - MVP STRICT.
 *
 * **FONCTIONNALITÉS MVP UNIQUEMENT :**
 * - Affichage des sujets pour utilisateurs connectés
 * - Abonnement/désabonnement d'un utilisateur à un sujet
 * - Nom unique obligatoire
 * - Peut ne pas avoir d'articles
 * - Peut ne pas avoir d'abonnés
 *
 * Table: subjects
 * - id: bigint AUTO_INCREMENT PRIMARY KEY
 * - name: varchar(100) NOT NULL UNIQUE
 * - created_at: timestamp DEFAULT CURRENT_TIMESTAMP
 * - updated_at: timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 *
 * INDEX DB :
 * - PRIMARY sur id
 * - UNIQUE sur name
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    /**
     * ID auto-généré.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Nom du sujet - IDENTIFIANT MÉTIER UNIQUE.
     * Exemples : "Java", "Angular", "DevOps"
     */
    @NotBlank(message = "Subject name is mandatory")
    @Size(max = 100, message = "Subject name must not exceed 100 characters")
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    /**
     * Date de création.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Utilisateurs abonnés à ce sujet.
     * RÈGLE MVP : Un utilisateur connecté peut s'abonner/se désabonner.
     */
    @ManyToMany(mappedBy = "subscribedSubjects", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> subscribers = new HashSet<>();

    /**
     * Constructeur pour création de sujet.
     */
    public Subject(String name) {
        this.name = name;
    }
}