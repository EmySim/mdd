package com.openclassrooms.mddapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Entité Article - Correspondance exacte avec la table articles.
 *
 * **DB-FIRST** : Structure basée sur la table MySQL existante.
 *
 * Table: articles
 * - id: bigint AUTO_INCREMENT PRIMARY KEY
 * - title: varchar(200) NOT NULL
 * - content: text NOT NULL
 * - created_at: timestamp DEFAULT CURRENT_TIMESTAMP
 * - updated_at: timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * - author_id: bigint NOT NULL (FK vers users)
 * - subject_id: bigint NOT NULL (FK vers subjects)
 *
 * INDEX DISPONIBLES :
 * - PRIMARY sur id
 * - INDEX fk_articles_author sur author_id
 * - INDEX fk_articles_subject sur subject_id
 *
 * RÈGLES MÉTIER :
 * - Auteur défini automatiquement (utilisateur connecté)
 * - Date de publication définie automatiquement
 * - Sujet obligatoire (choisi parmi la liste existante)
 * - Titre et contenu obligatoires
 * - Visible dans le fil d'actualité des abonnés au sujet
 * - Affiché par ordre chronologique
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Entity
@Table(name = "articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    /**
     * ID auto-généré - Correspondance avec colonne id.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Titre de l'article - Correspondance avec colonne title.
     * Maximum 200 caractères selon schéma DB.
     */
    @NotBlank(message = "Article title is mandatory")
    @Size(max = 200, message = "Article title must not exceed 200 characters")
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /**
     * Contenu de l'article - Correspondance avec colonne content.
     * Texte long stocké en TEXT dans la DB.
     */
    @NotBlank(message = "Article content is mandatory")
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Date de création - Correspondance avec colonne created_at.
     * Auto-générée par Hibernate.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Date de mise à jour - Correspondance avec colonne updated_at.
     * Auto-mise à jour par Hibernate.
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Référence vers l'auteur de l'article.
     * Clé étrangère vers la table users.
     * RÈGLE MÉTIER : Défini automatiquement (utilisateur connecté).
     */
    @NotNull(message = "Article author is mandatory")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    /**
     * Référence vers le sujet de l'article.
     * Clé étrangère vers la table subjects.
     * RÈGLE MÉTIER : Obligatoire, choisi parmi la liste existante.
     */
    @NotNull(message = "Article subject is mandatory")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    /**
     * Constructeur pour création d'article.
     * Les dates sont auto-générées par Hibernate.
     *
     * @param title   titre de l'article
     * @param content contenu de l'article
     * @param author  auteur de l'article
     * @param subject sujet de l'article
     */
    public Article(String title, String content, User author, Subject subject) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.subject = subject;
    }
}