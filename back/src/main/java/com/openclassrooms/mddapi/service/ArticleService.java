package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.ArticleDTO;
import com.openclassrooms.mddapi.entity.Article;
import com.openclassrooms.mddapi.entity.Subject;
import com.openclassrooms.mddapi.entity.User;
import com.openclassrooms.mddapi.mapper.ArticleMapper;
import com.openclassrooms.mddapi.repository.ArticleRepository;
import com.openclassrooms.mddapi.repository.SubjectRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;

/**
 * Service métier pour la gestion des articles.
 * 
 * Gère la création, lecture et récupération des articles avec tri chronologique
 * et fil d'actualité personnalisé selon les abonnements.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final ArticleMapper articleMapper;

    /**
     * Crée un nouvel article.
     * Auteur et sujet définis automatiquement, dates gérées par Hibernate.
     * 
     * @param articleDTO données de l'article à créer
     * @param authorEmail email de l'auteur (utilisateur connecté)
     * @return ArticleDTO de l'article créé
     * @throws EntityNotFoundException si l'auteur ou le sujet n'existe pas
     */
    @Transactional
    public ArticleDTO createArticle(ArticleDTO articleDTO, String authorEmail) {
        // Validation et récupération de l'auteur
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + authorEmail));

        // Validation et récupération du sujet
        Subject subject = subjectRepository.findById(articleDTO.getSubjectId())
                .orElseThrow(() -> new EntityNotFoundException("Sujet non trouvé avec ID: " + articleDTO.getSubjectId()));

        // Conversion DTO → Entity
        Article article = articleMapper.toEntity(articleDTO);

        // Définition des relations
        article.setAuthor(author);
        article.setSubject(subject);

        // Sauvegarde
        Article savedArticle = articleRepository.save(article);

        // Conversion Entity → DTO avec métadonnées complètes
        return articleMapper.toDTO(savedArticle);
    }

    /**
     * Récupère un article par son ID.
     * 
     * @param id ID de l'article
     * @return ArticleDTO complet
     * @throws EntityNotFoundException si l'article n'existe pas
     */
    public ArticleDTO getArticleById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Article non trouvé avec ID: " + id));

        return articleMapper.toDTO(article);
    }

    /**
     * Récupère tous les articles avec pagination et tri chronologique.
     * 
     * @param page numéro de page (0-based)
     * @param size taille de page
     * @param direction tri chronologique (ASC ou DESC)
     * @return Page d'ArticleDTO triée par date de création
     */
    public Page<ArticleDTO> getAllArticles(int page, int size, Sort.Direction direction) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        Page<Article> articlesPage = articleRepository.findAll(pageable);

        return articlesPage.map(articleMapper::toDTO);
    }

    /**
     * Récupère le fil d'actualité personnalisé d'un utilisateur.
     * Affiche les articles des sujets auxquels l'utilisateur est abonné.
     * 
     * @param userEmail email de l'utilisateur connecté
     * @param page numéro de page (0-based)
     * @param size taille de page
     * @return Page d'ArticleDTO du fil personnalisé
     * @throws EntityNotFoundException si l'utilisateur n'existe pas
     */
    public Page<ArticleDTO> getPersonalizedFeed(String userEmail, int page, int size) {
        // Récupération utilisateur
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + userEmail));

        Pageable pageable = PageRequest.of(page, size);
        Page<Article> feedPage = articleRepository.findPersonalizedFeed(user.getId(), pageable);

        return feedPage.map(articleMapper::toDTO);
    }

    /**
     * Récupère les articles d'un sujet spécifique par ordre chronologique.
     * 
     * @param subjectId ID du sujet
     * @param page numéro de page (0-based)
     * @param size taille de page
     * @return Page d'ArticleDTO du sujet triée par date (plus récent en premier)
     */
    public Page<ArticleDTO> getArticlesBySubject(Long subjectId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Article> articlesPage = articleRepository.findBySubjectIdOrderByCreatedAtDesc(subjectId, pageable);

        return articlesPage.map(articleMapper::toDTO);
    }
}