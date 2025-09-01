package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository Comment - Accès aux données selon spécifications MVP MDD.
 *
 * **RESPONSABILITÉ** : CRUD simple et méthodes de base uniquement.
 * Pas de logique métier complexe.
 *
 * MÉTHODES SIMPLES :
 * - CRUD de base (hérité de JpaRepository)
 * - Recherche par article avec tri chronologique
 * - Pas de @Query complexes (logique dans le Service)
 *
 * PERFORMANCE :
 * - Utilise les index DB existants (fk_comments_article, fk_comments_author)
 * - Pagination systématique
 * - Tri par date de création (ordre chronologique)
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Récupère les commentaires d'un article par ordre chronologique.
     *
     * RÈGLE MÉTIER : Affichage par ordre chronologique (plus ancien en premier
     * pour faciliter la lecture des échanges).
     *
     * PERFORMANCE : Utilise l'index fk_comments_article sur article_id.
     *
     * @param articleId ID de l'article
     * @param pageable  paramètres de pagination et tri
     * @return Page de commentaires de l'article triés par date
     */
    Page<Comment> findByArticleIdOrderByCreatedAtAsc(Long articleId, Pageable pageable);

    /**
     * Compte le nombre de commentaires d'un article.
     * Utile pour afficher le nombre total de commentaires.
     *
     * @param articleId ID de l'article
     * @return nombre de commentaires
     */
    long countByArticleId(Long articleId);

    /**
     * Récupère les commentaires d'un auteur spécifique.
     * Utile pour modération ou profil utilisateur.
     *
     * @param authorId ID de l'auteur
     * @param pageable paramètres de pagination
     * @return Page de commentaires de l'auteur
     */
    Page<Comment> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);

    /**
     * Vérifie si un utilisateur a déjà commenté un article.
     * Peut être utile pour des règles métier futures (limite de commentaires).
     *
     * @param articleId ID de l'article
     * @param authorId  ID de l'auteur
     * @return true si l'utilisateur a déjà commenté cet article
     */
    boolean existsByArticleIdAndAuthorId(Long articleId, Long authorId);

    /**
     * Récupère les derniers commentaires de tous les articles.
     * Utile pour un feed global de l'activité.
     *
     * @param pageable paramètres de pagination
     * @return Page des derniers commentaires
     */
    Page<Comment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Supprime tous les commentaires d'un article.
     * Cascade automatique via FK, mais méthode utile pour nettoyage explicite.
     *
     * @param articleId ID de l'article
     */
    void deleteByArticleId(Long articleId);

    /**
     * Récupère les statistiques de commentaires pour un utilisateur.
     * Compte total de commentaires créés par l'utilisateur.
     *
     * @param authorId ID de l'auteur
     * @return nombre total de commentaires de l'utilisateur
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.author.id = :authorId")
    long countCommentsByAuthor(@Param("authorId") Long authorId);
}