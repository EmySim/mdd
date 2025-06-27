package com.openclassrooms.mddapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO pour Comment - MVP STRICT.
 *
 * **SIMPLICITÉ** : Un seul DTO pour création et lecture.
 * Correspond exactement à la structure de la table comments.
 *
 * VALIDATION :
 * - Contenu : obligatoire (validation Bean Validation)
 * - Article ID : obligatoire pour création
 * - Author ID : auto-défini côté serveur (utilisateur connecté)
 *
 * USAGE :
 * - POST /api/articles/{articleId}/comments : création (content)
 * - GET /api/articles/{articleId}/comments : lecture avec métadonnées
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {

    /**
     * ID du commentaire.
     * NULL lors de la création, auto-généré par la DB.
     */
    private Long id;

    /**
     * Contenu du commentaire.
     * OBLIGATOIRE pour création selon règles métier MVP.
     */
    @NotBlank(message = "Le contenu du commentaire est obligatoire")
    private String content;

    /**
     * Date de création du commentaire.
     * READ-ONLY : auto-générée par @CreationTimestamp.
     */
    private LocalDateTime createdAt;

    /**
     * ID de l'auteur du commentaire.
     * AUTO-DÉFINI : extrait du token JWT côté serveur.
     */
    private Long authorId;

    /**
     * Nom d'utilisateur de l'auteur.
     * READ-ONLY : pour affichage frontend.
     * Récupéré via jointure User.username.
     */
    private String authorUsername;

    /**
     * ID de l'article commenté.
     * OBLIGATOIRE pour création (fourni via URL path parameter).
     */
    @NotNull(message = "L'article est obligatoire")
    private Long articleId;

    /**
     * Titre de l'article commenté.
     * READ-ONLY : pour affichage frontend optionnel.
     */
    private String articleTitle;

    /**
     * Constructeur minimal pour création de commentaire.
     * Utilisé par le frontend pour envoyer le contenu uniquement.
     *
     * @param content contenu du commentaire
     */
    public CommentDTO(String content) {
        this.content = content;
    }

    /**
     * Constructeur pour création avec article ID.
     *
     * @param content   contenu du commentaire
     * @param articleId ID de l'article commenté
     */
    public CommentDTO(String content, Long articleId) {
        this.content = content;
        this.articleId = articleId;
    }
}