package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.ArticleDTO;
import com.openclassrooms.mddapi.service.ArticleService;
import com.openclassrooms.mddapi.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

/**
 * Contrôleur REST Article - API selon spécifications MDD strictes.
 *
 * **ENDPOINTS IMPLÉMENTÉS** (selon règles métier) :
 * - GET /api/articles : Liste paginée avec tri chronologique
 * - GET /api/articles/{id} : Détail d'un article
 * - GET /api/articles/feed : Fil d'actualité personnalisé
 * - GET /api/articles/subject/{subjectId} : Articles d'un sujet
 * - POST /api/articles : Création d'un article
 *
 * **RÈGLES MÉTIER RESPECTÉES** :
 * - Auteur défini automatiquement (utilisateur connecté via SecurityUtils)
 * - Date de publication définie automatiquement
 * - Sujet obligatoire (choisi parmi la liste existante)
 * - Titre et contenu obligatoires
 * - Affichage par ordre chronologique (plus récent → plus ancien par défaut)
 * - Tri possible du plus ancien au plus récent
 * - Visible dans le fil d'actualité des abonnés au sujet
 *
 * **GESTION D'ERREURS** : Déléguée au GlobalExceptionHandler
 * - 400 : Validation échouée (Bean Validation)
 * - 404 : Ressource non trouvée (EntityNotFoundException)
 * - 409 : Utilisateur non authentifié (IllegalStateException)
 *
 * @author Équipe MDD
 * @version 1.0
 */
@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Slf4j
public class ArticleController {

    private final ArticleService articleService;

    /**
     * Liste paginée de tous les articles.
     *
     * RÈGLE MÉTIER : Affichage par ordre chronologique
     * - Par défaut : plus récent → plus ancien (desc)
     * - Optionnel : plus ancien → plus récent (asc)
     *
     * @param page numéro de page (0-based, défaut: 0)
     * @param size taille de page (défaut: 20, max: 100)
     * @param sort tri chronologique ("desc" par défaut, "asc" possible)
     * @return Page d'ArticleDTO
     */
    @GetMapping
    public ResponseEntity<Page<ArticleDTO>> getAllArticles(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "desc") String sort) {

        log.debug("📄 GET /api/articles - Page: {}, Size: {}, Sort: {}", page, size, sort);

        // Validation paramètre sort
        Sort.Direction direction = "asc".equalsIgnoreCase(sort) ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Page<ArticleDTO> articles = articleService.getAllArticles(page, size, direction);

        log.info("✅ {} articles retournés", articles.getNumberOfElements());
        return ResponseEntity.ok(articles);
    }

    /**
     * Détail complet d'un article par son ID.
     *
     * @param id ID de l'article
     * @return ArticleDTO complet
     */
    @GetMapping("/{id}")
    public ResponseEntity<ArticleDTO> getArticleById(@PathVariable Long id) {
        log.debug("🔍 GET /api/articles/{}", id);

        ArticleDTO article = articleService.getArticleById(id);

        log.info("✅ Article retourné: '{}' (ID: {})", article.getTitle(), id);
        return ResponseEntity.ok(article);
    }

    /**
     * Fil d'actualité personnalisé de l'utilisateur connecté.
     *
     * RÈGLE MÉTIER : Articles des sujets auxquels l'utilisateur est abonné,
     * triés par ordre chronologique (plus récent en premier).
     *
     * @param page numéro de page (0-based, défaut: 0)
     * @param size taille de page (défaut: 20, max: 100)
     * @return Page d'ArticleDTO du fil personnalisé
     */
    @GetMapping("/feed")
    public ResponseEntity<Page<ArticleDTO>> getPersonalizedFeed(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.debug("📱 GET /api/articles/feed - Utilisateur: {}, Page: {}, Size: {}",
                userEmail, page, size);

        Page<ArticleDTO> feed = articleService.getPersonalizedFeed(userEmail, page, size);

        log.info("📱 Fil personnalisé: {} articles pour {}",
                feed.getNumberOfElements(), userEmail);

        return ResponseEntity.ok(feed);
    }

    /**
     * Articles d'un sujet spécifique.
     * Tri chronologique (plus récent en premier).
     *
     * @param subjectId ID du sujet
     * @param page numéro de page (0-based, défaut: 0)
     * @param size taille de page (défaut: 20, max: 100)
     * @return Page d'ArticleDTO du sujet
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<Page<ArticleDTO>> getArticlesBySubject(
            @PathVariable Long subjectId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        log.debug("📂 GET /api/articles/subject/{} - Page: {}, Size: {}", subjectId, page, size);

        Page<ArticleDTO> articles = articleService.getArticlesBySubject(subjectId, page, size);

        log.info("📂 {} articles retournés pour le sujet ID: {}",
                articles.getNumberOfElements(), subjectId);

        return ResponseEntity.ok(articles);
    }

    /**
     * Création d'un nouvel article.
     *
     * RÈGLES MÉTIER :
     * - Auteur défini automatiquement (utilisateur connecté via SecurityUtils)
     * - Date de publication définie automatiquement
     * - Sujet obligatoire (choisi parmi la liste existante)
     * - Titre et contenu obligatoires (validation Bean Validation)
     *
     * @param articleDTO données de l'article à créer
     * @return ArticleDTO créé avec statut 201 Created
     */
    @PostMapping
    public ResponseEntity<ArticleDTO> createArticle(@Valid @RequestBody ArticleDTO articleDTO) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.info("📝 POST /api/articles - Création par: {}", userEmail);
        log.debug("📝 Données: titre='{}', sujet ID={}", articleDTO.getTitle(), articleDTO.getSubjectId());

        ArticleDTO createdArticle = articleService.createArticle(articleDTO, userEmail);

        log.info("✅ Article créé: '{}' (ID: {}) par {}",
                createdArticle.getTitle(), createdArticle.getId(), userEmail);

        return new ResponseEntity<>(createdArticle, HttpStatus.CREATED);
    }
}