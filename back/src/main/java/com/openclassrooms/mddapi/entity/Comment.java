package com.openclassrooms.mddapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Entité Comment - Correspondance exacte avec la table comments.
 *
 * **MVP STRICT** : Commentaires simples sur articles uniquement.
 * Pas de sous-commentaires, pas de récursivité.
 *
 * Table: comments
 * - id: bigint AUTO_INCREMENT PRIMARY KEY
 * - content: text NOT NULL
 * - created_at: timestamp DEFAULT CURRENT_TIMESTAMP
 * - updated_at: timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * - author_id: bigint NOT NULL (FK vers users)
 * - article_id: bigint NOT NULL (FK vers articles)
 *
 * INDEX DISPONIBLES :
 * - PRIMARY sur id
 * - INDEX fk_comments_author sur author_id
 * - INDEX fk_comments_article sur article_id
 *
 * RÈGLES MÉTIER MVP :
 * - Auteur défini automatiquement (utilisateur connecté)
 * - Date définie automatiquement
 * - Contenu obligatoire
 * - Appartient obligatoirement à UN article
 * - Pas de sous-commentaires
 * - Visible dans la consultation détaillée de l'article
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    /**
     * ID auto-généré - Correspondance avec colonne id.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Contenu du commentaire - Correspondance avec colonne content.
     * Obligatoire selon règles métier MVP.
     */
    @NotBlank(message = "Comment content is mandatory")
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Date de création - Correspondance avec colonne created_at.
     * RÈGLE MÉTIER : Auto-générée, définie automatiquement.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Référence vers l'auteur du commentaire.
     * Clé étrangère vers la table users.
     * RÈGLE MÉTIER : Défini automatiquement (utilisateur connecté).
     */
    @NotNull(message = "Comment author is mandatory")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    /**
     * Référence vers l'article commenté.
     * Clé étrangère vers la table articles.
     * RÈGLE MÉTIER : Appartient obligatoirement à UN article.
     */
    @NotNull(message = "Comment article is mandatory")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    /**
     * Constructeur pour création de commentaire.
     * La date est auto-générée par Hibernate.
     *
     * @param content contenu du commentaire
     * @param author  auteur du commentaire
     * @param article article commenté
     */
    public Comment(String content, User author, Article article) {
        this.content = content;
        this.author = author;
        this.article = article;
    }
}