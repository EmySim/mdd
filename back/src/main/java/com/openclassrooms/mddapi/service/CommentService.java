package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.CommentDTO;
import com.openclassrooms.mddapi.entity.Article;
import com.openclassrooms.mddapi.entity.Comment;
import com.openclassrooms.mddapi.entity.User;
import com.openclassrooms.mddapi.mapper.CommentMapper;
import com.openclassrooms.mddapi.repository.ArticleRepository;
import com.openclassrooms.mddapi.repository.CommentRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;

/**
 * Service métier pour la gestion des commentaires.
 * 
 * Gère la création, lecture et suppression des commentaires avec tri chronologique
 * et validation des droits d'auteur.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    /**
     * Crée un nouveau commentaire sur un article.
     * Auteur et article définis automatiquement, date gérée par Hibernate.
     * 
     * @param articleId ID de l'article à commenter
     * @param commentDTO données du commentaire à créer
     * @param authorEmail email de l'auteur (utilisateur connecté)
     * @return CommentDTO du commentaire créé
     * @throws EntityNotFoundException si l'auteur ou l'article n'existe pas
     */
    @Transactional
    public CommentDTO createComment(Long articleId, CommentDTO commentDTO, String authorEmail) {
        // Validation et récupération de l'auteur
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + authorEmail));

        // Validation et récupération de l'article
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new EntityNotFoundException("Article non trouvé avec ID: " + articleId));

        // Conversion DTO → Entity
        Comment comment = commentMapper.toEntity(commentDTO);

        // Définition des relations
        comment.setAuthor(author);
        comment.setArticle(article);

        // Sauvegarde
        Comment savedComment = commentRepository.save(comment);

        // Conversion Entity → DTO avec métadonnées complètes
        return commentMapper.toDTO(savedComment);
    }

    /**
     * Récupère tous les commentaires d'un article avec pagination.
     * Tri chronologique (plus ancien en premier pour suivre la conversation).
     * 
     * @param articleId ID de l'article
     * @param page numéro de page (0-based)
     * @param size taille de page
     * @return Page de CommentDTO triée par date de création
     * @throws EntityNotFoundException si l'article n'existe pas
     */
    public Page<CommentDTO> getCommentsByArticle(Long articleId, int page, int size) {
        // Vérification que l'article existe
        if (!articleRepository.existsById(articleId)) {
            throw new EntityNotFoundException("Article non trouvé avec ID: " + articleId);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentsPage = commentRepository.findByArticleIdOrderByCreatedAtAsc(articleId, pageable);

        return commentsPage.map(commentMapper::toDTO);
    }

    /**
     * Récupère un commentaire par son ID.
     * 
     * @param id ID du commentaire
     * @return CommentDTO complet
     * @throws EntityNotFoundException si le commentaire n'existe pas
     */
    public CommentDTO getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Commentaire non trouvé avec ID: " + id));

        return commentMapper.toDTO(comment);
    }

    /**
     * Compte le nombre de commentaires d'un article.
     * 
     * @param articleId ID de l'article
     * @return nombre de commentaires
     */
    public long countCommentsByArticle(Long articleId) {
        return commentRepository.countByArticleId(articleId);
    }

    /**
     * Supprime un commentaire.
     * Seul l'auteur peut supprimer son propre commentaire.
     * 
     * @param commentId ID du commentaire à supprimer
     * @param userEmail email de l'utilisateur connecté
     * @throws EntityNotFoundException si le commentaire n'existe pas
     * @throws IllegalStateException si l'utilisateur n'est pas l'auteur
     */
    @Transactional
    public void deleteComment(Long commentId, String userEmail) {
        // Récupération du commentaire
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Commentaire non trouvé avec ID: " + commentId));

        // Vérification que l'utilisateur connecté est l'auteur
        if (!comment.getAuthor().getEmail().equals(userEmail)) {
            throw new IllegalStateException("Vous ne pouvez supprimer que vos propres commentaires");
        }

        // Suppression
        commentRepository.delete(comment);
    }

    /**
     * Récupère les commentaires d'un utilisateur avec pagination.
     * 
     * @param userEmail email de l'utilisateur
     * @param page numéro de page
     * @param size taille de page
     * @return Page de CommentDTO de l'utilisateur
     */
    public Page<CommentDTO> getCommentsByUser(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + userEmail));

        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentsPage = commentRepository.findByAuthorIdOrderByCreatedAtDesc(user.getId(), pageable);

        return commentsPage.map(commentMapper::toDTO);
    }

    /**
     * Vérifie si un utilisateur a déjà commenté un article.
     * 
     * @param articleId ID de l'article
     * @param userEmail email de l'utilisateur
     * @return true si l'utilisateur a déjà commenté
     */
    public boolean hasUserCommentedArticle(Long articleId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + userEmail));

        return commentRepository.existsByArticleIdAndAuthorId(articleId, user.getId());
    }
}