package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.CommentDTO;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
import com.openclassrooms.mddapi.service.CommentService;
import com.openclassrooms.mddapi.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
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
 * Gère les commentaires associés aux articles avec tri chronologique.
 * 
 * @author Équipe MDD
 * @version 1.0
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /**
     * Liste paginée des commentaires d'un article par ordre chronologique.
     * 
     * @param articleId ID de l'article
     * @param page numéro de page (défaut: 0)
     * @param size taille de page (défaut: 20, max: 100)
     * @return Page de CommentDTO
     */
    @GetMapping("/articles/{articleId}/comments")
    public ResponseEntity<Page<CommentDTO>> getCommentsByArticle(
            @PathVariable Long articleId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        Page<CommentDTO> comments = commentService.getCommentsByArticle(articleId, page, size);
        return ResponseEntity.ok(comments);
    }

    /**
     * Crée un commentaire sur un article.
     * Auteur défini automatiquement via l'utilisateur connecté.
     * 
     * @param articleId ID de l'article
     * @param commentDTO données du commentaire
     * @return CommentDTO créé avec statut 201
     */
    @PostMapping("/articles/{articleId}/comments")
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable Long articleId,
            @Valid @RequestBody CommentDTO commentDTO) {

        String userEmail = SecurityUtils.getCurrentUserEmail();
        CommentDTO createdComment = commentService.createComment(articleId, commentDTO, userEmail);
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    /**
     * Récupère un commentaire par son ID.
     * 
     * @param id ID du commentaire
     * @return CommentDTO
     */
    @GetMapping("/comments/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable Long id) {
        CommentDTO comment = commentService.getCommentById(id);
        return ResponseEntity.ok(comment);
    }

    /**
     * Endpoint de santé du service de commentaires.
     * 
     * @return MessageResponse avec statut du service
     */
    @GetMapping("/comments/health")
    public ResponseEntity<MessageResponse> getHealth() {
        return ResponseEntity.ok(MessageResponse.success("Comments service is operational"));
    }
}