package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.CommentDTO;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
import com.openclassrooms.mddapi.service.CommentService;
import com.openclassrooms.mddapi.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

/**
 * Contrôleur REST Comment - API selon spécifications MVP MDD strictes.
 *
 * **ENDPOINTS MVP IMPLÉMENTÉS** (selon règles métier) :
 * - GET /api/articles/{articleId}/comments : Liste des commentaires d'un article
 * - POST /api/articles/{articleId}/comments : Créer un commentaire sur un article
 * - GET /api/comments/{id} : Détail d'un commentaire
 * - DELETE /api/comments/{id} : Supprimer son propre commentaire
 *
 * **RÈGLES MÉTIER MVP RESPECTÉES** :
 * - Auteur défini automatiquement (utilisateur connecté via SecurityUtils)
 * - Date définie automatiquement
 * - Contenu obligatoire
 * - Appartient obligatoirement à UN article
 * - Pas de sous-commentaires (pas de récursivité)
 * - Visible dans la consultation détaillée de l'article
 * - Affichage par ordre chronologique (plus ancien en premier)
 * - Seul l'auteur peut supprimer son commentaire
 *
 * **GESTION D'ERREURS** : Déléguée au GlobalExceptionHandler
 * - 400 : Validation échouée (Bean Validation)
 * - 403 : Tentative de suppression du commentaire d'autrui
 * - 404 : Ressource non trouvée (EntityNotFoundException)
 * - 409 : Utilisateur non authentifié (IllegalStateException)
 *
 * @author Équipe MDD
 * @version 1.0
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final CommentService commentService;

    // ============================================================================
    // ENDPOINTS LIÉS AUX ARTICLES
    // ============================================================================

    /**
     * Liste paginée des commentaires d'un article.
     * <p>
     * RÈGLE MÉTIER MVP : Affichage par ordre chronologique
     * (plus ancien en premier pour faciliter la lecture des échanges).
     *
     * @param articleId ID de l'article
     * @param page      numéro de page (0-based, défaut: 0)
     * @param size      taille de page (défaut: 20, max: 100)
     * @return Page de CommentDTO de l'article
     */
    @GetMapping("/articles/{articleId}/comments")
    public ResponseEntity<Page<CommentDTO>> getCommentsByArticle(
            @PathVariable Long articleId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        log.debug("💬 GET /api/articles/{}/comments - Page: {}, Size: {}", articleId, page, size);

        Page<CommentDTO> comments = commentService.getCommentsByArticle(articleId, page, size);

        log.info("✅ {} commentaires retournés pour l'article ID: {}",
                comments.getNumberOfElements(), articleId);

        return ResponseEntity.ok(comments);
    }

    /**
     * Création d'un nouveau commentaire sur un article.
     * <p>
     * RÈGLES MÉTIER MVP :
     * - Auteur défini automatiquement (utilisateur connecté via SecurityUtils)
     * - Date définie automatiquement
     * - Contenu obligatoire (validation Bean Validation)
     * - Appartient obligatoirement à l'article spécifié
     *
     * @param articleId  ID de l'article à commenter
     * @param commentDTO données du commentaire à créer
     * @return CommentDTO créé avec statut 201 Created
     */
    @PostMapping("/articles/{articleId}/comments")
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable Long articleId,
            @Valid @RequestBody CommentDTO commentDTO) {

        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.info("💬 POST /api/articles/{}/comments - Création par: {}", articleId, userEmail);
        log.debug("💬 Contenu: '{}'", commentDTO.getContent());

        CommentDTO createdComment = commentService.createComment(articleId, commentDTO, userEmail);

        log.info("✅ Commentaire créé (ID: {}) sur article ID: {} par {}",
                createdComment.getId(), articleId, userEmail);

        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    /**
     * Compte le nombre de commentaires d'un article.
     * Endpoint utilitaire pour l'affichage dans l'interface.
     *
     * @param articleId ID de l'article
     * @return Objet avec le nombre de commentaires
     */
    @GetMapping("/articles/{articleId}/comments/count")
    public ResponseEntity<MessageResponse> getCommentsCount(@PathVariable Long articleId) {
        log.debug("📊 GET /api/articles/{}/comments/count", articleId);

        long count = commentService.countCommentsByArticle(articleId);

        log.debug("📊 {} commentaires pour l'article ID: {}", count, articleId);

        return ResponseEntity.ok(MessageResponse.info(
                String.format("Article contient %d commentaire(s)", count)
        ));
    }

    // ============================================================================
    // ENDPOINTS LIÉS AUX COMMENTAIRES
    // ============================================================================

    /**
     * Détail complet d'un commentaire par son ID.
     * Utile pour modération ou affichage détaillé.
     *
     * @param id ID du commentaire
     * @return CommentDTO complet
     */
    @GetMapping("/comments/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable Long id) {
        log.debug("🔍 GET /api/comments/{}", id);

        CommentDTO comment = commentService.getCommentById(id);

        log.info("✅ Commentaire retourné (ID: {}) par: {}", id, comment.getAuthorUsername());
        return ResponseEntity.ok(comment);
    }

    /**
     * Suppression d'un commentaire.
     * <p>
     * RÈGLE MÉTIER MVP : Seul l'auteur peut supprimer son propre commentaire.
     * La vérification est effectuée côté service.
     *
     * @param id ID du commentaire à supprimer
     * @return Message de confirmation
     */
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<MessageResponse> deleteComment(@PathVariable Long id) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.info("🗑️ DELETE /api/comments/{} - Suppression par: {}", id, userEmail);

        commentService.deleteComment(id, userEmail);

        log.info("✅ Commentaire supprimé (ID: {}) par {}", id, userEmail);
        return ResponseEntity.ok(MessageResponse.success("Commentaire supprimé avec succès"));
    }

    // ============================================================================
    // ENDPOINTS UTILISATEUR (OPTIONNELS MVP)
    // ============================================================================

    /**
     * Liste des commentaires de l'utilisateur connecté.
     * Utile pour profil utilisateur ou historique.
     *
     * @param page numéro de page (0-based, défaut: 0)
     * @param size taille de page (défaut: 20, max: 100)
     * @return Page de CommentDTO de l'utilisateur
     */
    @GetMapping("/user/comments")
    public ResponseEntity<Page<CommentDTO>> getCurrentUserComments(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.debug("👤 GET /api/user/comments - Utilisateur: {}, Page: {}, Size: {}",
                userEmail, page, size);

        Page<CommentDTO> comments = commentService.getCommentsByUser(userEmail, page, size);

        log.info("👤 {} commentaires retournés pour l'utilisateur: {}",
                comments.getNumberOfElements(), userEmail);

        return ResponseEntity.ok(comments);
    }

    /**
     * Vérifie si l'utilisateur connecté a déjà commenté un article.
     * Utile pour l'interface utilisateur (afficher/masquer le formulaire).
     *
     * @param articleId ID de l'article
     * @return Statut de commentaire de l'utilisateur
     */
    @GetMapping("/articles/{articleId}/comments/my-status")
    public ResponseEntity<MessageResponse> getMyCommentStatus(@PathVariable Long articleId) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.debug("🔍 GET /api/articles/{}/comments/my-status - Utilisateur: {}",
                articleId, userEmail);

        boolean hasCommented = commentService.hasUserCommentedArticle(articleId, userEmail);

        String message = hasCommented ?
                "Vous avez déjà commenté cet article" :
                "Vous n'avez pas encore commenté cet article";

        return ResponseEntity.ok(MessageResponse.info(message));
    }

    // ============================================================================
    // HEALTH CHECK
    // ============================================================================

    /**
     * Health check endpoint pour les commentaires.
     *
     * @return Status message
     */
    @GetMapping("/comments/health")
    public ResponseEntity<MessageResponse> getHealth() {
        log.debug("🔍 GET /api/comments/health - Health check");
        return ResponseEntity.ok(MessageResponse.success("Comments service is operational"));
    }
}