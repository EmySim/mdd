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
 * Contrôleur REST pour la gestion des commentaires.
 * 
 * Gère les commentaires associés aux articles avec authentification JWT.
 * Tri chronologique par défaut (plus ancien en premier).
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

    /**
     * Liste paginée des commentaires d'un article.
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
     * Création d'un commentaire sur un article.
     */
    @PostMapping("/articles/{articleId}/comments")
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable Long articleId,
            @Valid @RequestBody CommentDTO commentDTO) {

        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.info("💬 POST /api/articles/{}/comments - Création par: {}", articleId, userEmail);

        CommentDTO createdComment = commentService.createComment(articleId, commentDTO, userEmail);

        log.info("✅ Commentaire créé (ID: {}) sur article ID: {} par {}",
                createdComment.getId(), articleId, userEmail);

        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    /**
     * Détail d'un commentaire par son ID.
     */
    @GetMapping("/comments/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable Long id) {
        log.debug("🔍 GET /api/comments/{}", id);

        CommentDTO comment = commentService.getCommentById(id);

        log.info("✅ Commentaire retourné (ID: {}) par: {}", id, comment.getAuthorUsername());
        return ResponseEntity.ok(comment);
    }

    /**
     * Health check endpoint.
     */
    @GetMapping("/comments/health")
    public ResponseEntity<MessageResponse> getHealth() {
        return ResponseEntity.ok(MessageResponse.success("Comments service is operational"));
    }
}