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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;

/**
 * Service métier Article - Gestion selon spécifications MDD strictes.
 *
 * **RESPONSABILITÉS** (uniquement ce qui est demandé) :
 * - Création d'articles avec validation métier
 * - Lecture d'articles avec tri chronologique
 * - Fil d'actualité personnalisé selon abonnements
 * - Articles par sujet
 *
 * RÈGLES MÉTIER IMPLÉMENTÉES :
 * - Auteur défini automatiquement (utilisateur connecté)
 * - Date de publication définie automatiquement
 * - Sujet obligatoire (choisi parmi la liste existante)
 * - Titre et contenu obligatoires
 * - Affichage par ordre chronologique (plus récent → plus ancien par défaut)
 * - Tri possible du plus ancien au plus récent
 * - Visible dans le fil d'actualité des abonnés au sujet
 *
 * **PAS D'OVER-ENGINEERING** : Uniquement les fonctionnalités demandées.
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final ArticleMapper articleMapper;

    // ============================================================================
    // CRÉATION D'ARTICLES
    // ============================================================================

    /**
     * Crée un nouvel article.
     *
     * RÈGLES MÉTIER :
     * - Auteur extrait du contexte de sécurité (utilisateur connecté)
     * - Sujet obligatoire et doit exister
     * - Titre et contenu obligatoires (validation DTO)
     * - Dates auto-générées par Hibernate
     *
     * @param articleDTO données de l'article à créer
     * @param authorEmail email de l'auteur (utilisateur connecté)
     * @return ArticleDTO de l'article créé
     * @throws EntityNotFoundException si l'auteur ou le sujet n'existe pas
     */
    @Transactional
    public ArticleDTO createArticle(ArticleDTO articleDTO, String authorEmail) {
        log.info("📝 Création article: '{}' par {}", articleDTO.getTitle(), authorEmail);

        // Validation et récupération de l'auteur
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + authorEmail));

        // Validation et récupération du sujet
        Subject subject = subjectRepository.findById(articleDTO.getSubjectId())
                .orElseThrow(() -> new EntityNotFoundException("Sujet non trouvé avec ID: " + articleDTO.getSubjectId()));

        // Conversion DTO → Entity
        Article article = articleMapper.toEntity(articleDTO);

        // Définition des relations (pas gérées par le mapper)
        article.setAuthor(author);
        article.setSubject(subject);

        // Sauvegarde (ID auto-généré, dates auto-créées)
        Article savedArticle = articleRepository.save(article);

        log.info("✅ Article créé: '{}' (ID: {})", savedArticle.getTitle(), savedArticle.getId());

        // Conversion Entity → DTO avec métadonnées complètes
        return articleMapper.toDTO(savedArticle);
    }

    // ============================================================================
    // LECTURE D'ARTICLES
    // ============================================================================

    /**
     * Récupère un article par son ID.
     *
     * @param id ID de l'article
     * @return ArticleDTO complet
     * @throws EntityNotFoundException si l'article n'existe pas
     */
    public ArticleDTO getArticleById(Long id) {
        log.debug("🔍 Recherche article ID: {}", id);

        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Article non trouvé avec ID: " + id));

        return articleMapper.toDTO(article);
    }

    /**
     * Récupère tous les articles avec pagination et tri chronologique.
     *
     * RÈGLE MÉTIER : Affichage par ordre chronologique
     * - Par défaut : plus récent → plus ancien (DESC)
     * - Optionnel : plus ancien → plus récent (ASC)
     *
     * @param page numéro de page (0-based)
     * @param size taille de page
     * @param direction tri chronologique (ASC ou DESC)
     * @return Page d'ArticleDTO
     */
    public Page<ArticleDTO> getAllArticles(int page, int size, Sort.Direction direction) {
        log.debug("📄 Liste articles - Page: {}, Size: {}, Sort: {}", page, size, direction);

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        Page<Article> articlesPage = articleRepository.findAll(pageable);

        log.debug("📊 {} articles trouvés", articlesPage.getNumberOfElements());

        // Conversion Page<Entity> → Page<DTO>
        return articlesPage.map(articleMapper::toDTO);
    }

    /**
     * Récupère le fil d'actualité personnalisé d'un utilisateur.
     *
     * RÈGLE MÉTIER : Affiche les articles des sujets auxquels l'utilisateur
     * est abonné, triés par date de création (plus récent en premier).
     *
     * @param userEmail email de l'utilisateur connecté
     * @param page numéro de page (0-based)
     * @param size taille de page
     * @return Page d'ArticleDTO du fil personnalisé
     * @throws EntityNotFoundException si l'utilisateur n'existe pas
     */
    public Page<ArticleDTO> getPersonalizedFeed(String userEmail, int page, int size) {
        log.debug("📱 Fil personnalisé pour: {} - Page: {}, Size: {}", userEmail, page, size);

        // Récupération utilisateur
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + userEmail));

        Pageable pageable = PageRequest.of(page, size);
        Page<Article> feedPage = articleRepository.findPersonalizedFeed(user.getId(), pageable);

        log.info("📱 Fil personnalisé: {} articles pour {}",
                feedPage.getNumberOfElements(), user.getUsername());

        return feedPage.map(articleMapper::toDTO);
    }

    /**
     * Récupère les articles d'un sujet spécifique.
     * Tri chronologique (plus récent en premier).
     *
     * @param subjectId ID du sujet
     * @param page numéro de page (0-based)
     * @param size taille de page
     * @return Page d'ArticleDTO du sujet
     */
    public Page<ArticleDTO> getArticlesBySubject(Long subjectId, int page, int size) {
        log.debug("📂 Articles du sujet ID: {} - Page: {}, Size: {}", subjectId, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<Article> articlesPage = articleRepository.findBySubjectIdOrderByCreatedAtDesc(subjectId, pageable);

        log.debug("📂 {} articles trouvés pour le sujet ID: {}",
                articlesPage.getNumberOfElements(), subjectId);

        return articlesPage.map(articleMapper::toDTO);
    }
}
