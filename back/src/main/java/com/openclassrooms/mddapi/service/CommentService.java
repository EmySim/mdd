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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;

/**
 * Service métier Comment - Gestion selon spécifications MVP MDD strictes.
 *
 * **RESPONSABILITÉS** (uniquement ce qui est demandé MVP) :
 * - Création de commentaires avec validation métier
 * - Lecture de commentaires par article avec tri chronologique
 * - Suppression de ses propres commentaires
 *
 * RÈGLES MÉTIER IMPLÉMENTÉES :
 * - Auteur défini automatiquement (utilisateur connecté)
 * - Date définie automatiquement
 * - Contenu obligatoire
 * - Appartient obligatoirement à UN article
 * - Pas de sous-commentaires (pas de récursivité)
 * - Visible dans la consultation détaillée de l'article
 * - Affichage par ordre chronologique (plus ancien en premier pour suivre la conversation)
 *
 * **PAS D'OVER-ENGINEERING** : Uniquement les fonctionnalités MVP demandées.
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    // ============================================================================
    // CRÉATION DE COMMENTAIRES
    // ============================================================================

    /**
     * Crée un nouveau commentaire sur un article.
     *
     * RÈGLES MÉTIER MVP :
     * - Auteur extrait du contexte de sécurité (utilisateur connecté)
     * - Article obligatoire et doit exister
     * - Contenu obligatoire (validation DTO)
     * - Date auto-générée par Hibernate
     * - Pas de sous-commentaires
     *
     * @param articleId    ID de l'article à commenter
     * @param commentDTO   données du commentaire à créer
     * @param authorEmail  email de l'auteur (utilisateur connecté)
     * @return CommentDTO du commentaire créé
     * @throws EntityNotFoundException si l'auteur ou l'article n'existe pas
     */
    @Transactional
    public CommentDTO createComment(Long articleId, CommentDTO commentDTO, String authorEmail) {
        log.info("💬 Création commentaire sur article ID: {} par {}", articleId, authorEmail);

        // Validation et récupération de l'auteur
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + authorEmail));

        // Validation et récupération de l'article
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new EntityNotFoundException("Article non trouvé avec ID: " + articleId));

        // Conversion DTO → Entity
        Comment comment = commentMapper.toEntity(commentDTO);

        // Définition des relations (pas gérées par le mapper)
        comment.setAuthor(author);
        comment.setArticle(article);

        // Sauvegarde (ID auto-généré, date auto-créée)
        Comment savedComment = commentRepository.save(comment);

        log.info("✅ Commentaire créé (ID: {}) sur article '{}' par {}",
                savedComment.getId(), article.getTitle(), authorEmail);

        // Conversion Entity → DTO avec métadonnées complètes
        return commentMapper.toDTO(savedComment);
    }

    // ============================================================================
    // LECTURE DE COMMENTAIRES
    // ============================================================================

    /**
     * Récupère tous les commentaires d'un article avec pagination.
     *
     * RÈGLE MÉTIER MVP : Affichage par ordre chronologique
     * (plus ancien en premier pour faciliter la lecture des échanges).
     *
     * @param articleId ID de l'article
     * @param page      numéro de page (0-based)
     * @param size      taille de page
     * @return Page de CommentDTO de l'article
     * @throws EntityNotFoundException si l'article n'existe pas
     */
    public Page<CommentDTO> getCommentsByArticle(Long articleId, int page, int size) {
        log.debug("💬 Liste commentaires article ID: {} - Page: {}, Size: {}", articleId, page, size);

        // Vérification que l'article existe
        if (!articleRepository.existsById(articleId)) {
            throw new EntityNotFoundException("Article non trouvé avec ID: " + articleId);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentsPage = commentRepository.findByArticleIdOrderByCreatedAtAsc(articleId, pageable);

        log.debug("💬 {} commentaires trouvés pour l'article ID: {}",
                commentsPage.getNumberOfElements(), articleId);

        // Conversion Page<Entity> → Page<DTO>
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
        log.debug("🔍 Recherche commentaire ID: {}", id);

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Commentaire non trouvé avec ID: " + id));

        return commentMapper.toDTO(comment);
    }

    /**
     * Compte le nombre de commentaires d'un article.
     * Utile pour afficher le nombre total dans l'interface.
     *
     * @param articleId ID de l'article
     * @return nombre de commentaires
     */
    public long countCommentsByArticle(Long articleId) {
        log.debug("📊 Comptage commentaires article ID: {}", articleId);
        return commentRepository.countByArticleId(articleId);
    }

    // ============================================================================
    // SUPPRESSION DE COMMENTAIRES
    // ============================================================================

    /**
     * Supprime un commentaire.
     * RÈGLE MÉTIER : Seul l'auteur peut supprimer son commentaire.
     *
     * @param commentId   ID du commentaire à supprimer
     * @param userEmail   email de l'utilisateur connecté
     * @throws EntityNotFoundException si le commentaire n'existe pas
     * @throws IllegalStateException   si l'utilisateur n'est pas l'auteur
     */
    @Transactional
    public void deleteComment(Long commentId, String userEmail) {
        log.info("🗑️ Suppression commentaire ID: {} par {}", commentId, userEmail);

        // Récupération du commentaire
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Commentaire non trouvé avec ID: " + commentId));

        // Vérification que l'utilisateur connecté est l'auteur
        if (!comment.getAuthor().getEmail().equals(userEmail)) {
            throw new IllegalStateException("Vous ne pouvez supprimer que vos propres commentaires");
        }

        // Suppression
        commentRepository.delete(comment);

        log.info("✅ Commentaire supprimé (ID: {}) par {}", commentId, userEmail);
    }

    // ============================================================================
    // MÉTHODES UTILITAIRES
    // ============================================================================

    /**
     * Récupère les commentaires d'un utilisateur.
     * Utile pour profil utilisateur ou modération.
     *
     * @param userEmail email de l'utilisateur
     * @param page      numéro de page
     * @param size      taille de page
     * @return Page de CommentDTO de l'utilisateur
     */
    public Page<CommentDTO> getCommentsByUser(String userEmail, int page, int size) {
        log.debug("👤 Commentaires utilisateur: {} - Page: {}, Size: {}", userEmail, page, size);

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