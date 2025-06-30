package com.openclassrooms.mddapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * DTO pour Article - DTO unique pour toutes les opérations.
 *
 * **SIMPLICITÉ** : Un seul DTO pour création, lecture et mise à jour.
 * Correspond exactement à la structure de la table articles.
 *
 * VALIDATION :
 * - Titre : obligatoire, max 200 caractères (contrainte DB)
 * - Contenu : obligatoire, texte libre (TEXT en DB)
 * - Subject ID : obligatoire pour création
 * - Author ID : auto-défini côté serveur (utilisateur connecté)
 *
 * USAGE :
 * - POST /api/articles : création (title, content, subjectId)
 * - GET /api/articles : lecture complète avec métadonnées
 * - GET /api/articles/{id} : détail d'un article
 *
 * INDEX DB DISPONIBLES :
 * - PRIMARY sur id
 * - INDEX sur author_id (fk_articles_author)
 * - INDEX sur subject_id (fk_articles_subject)
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDTO {

    /**
     * ID de l'article.
     * NULL lors de la création, auto-généré par la DB.
     * PRIMARY KEY avec auto-increment.
     */
    private Long id;

    /**
     * Titre de l'article.
     * OBLIGATOIRE pour création.
     * Max 200 caractères selon contrainte DB (varchar(200)).
     */
    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 200, message = "Le titre ne peut pas dépasser 200 caractères")
    private String title;

    /**
     * Contenu de l'article.
     * OBLIGATOIRE pour création.
     * Stocké en TEXT (pas de limite de taille).
     */
    @NotBlank(message = "Le contenu est obligatoire")
    private String content;

    /**
     * Date de création de l'article.
     * READ-ONLY : auto-générée par @CreationTimestamp.
     */
    private LocalDateTime createdAt;

    /**
     * Date de dernière mise à jour.
     * READ-ONLY : auto-mise à jour par @UpdateTimestamp.
     */
    private LocalDateTime updatedAt;

    /**
     * ID de l'auteur de l'article.
     * AUTO-DÉFINI : extrait du token JWT côté serveur.
     * INDEX DB disponible (fk_articles_author).
     */
    private Long authorId;

    /**
     * Nom d'utilisateur de l'auteur.
     * READ-ONLY : pour affichage frontend.
     * Récupéré via jointure User.username.
     */
    private String authorUsername;

    /**
     * ID du sujet associé à l'article.
     * OBLIGATOIRE pour création.
     * INDEX DB disponible (fk_articles_subject).
     */
    @NotNull(message = "Le sujet est obligatoire")
    private Long subjectId;

    /**
     * Nom du sujet associé.
     * READ-ONLY : pour affichage frontend.
     * Récupéré via jointure Subject.name.
     */
    private String subjectName;

    /**
     * Constructeur minimal pour création d'article.
     * Utilisé par le frontend pour envoyer les données essentielles.
     *
     * @param title     titre de l'article
     * @param content   contenu de l'article
     * @param subjectId ID du sujet associé
     */
    public ArticleDTO(String title, String content, Long subjectId) {
        this.title = title;
        this.content = content;
        this.subjectId = subjectId;
    }
}