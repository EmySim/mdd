package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.ArticleDTO;
import com.openclassrooms.mddapi.service.ArticleService;
import com.openclassrooms.mddapi.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

/**
 * Contrôleur REST pour la gestion des articles.
 * 
 * Endpoints : GET /api/articles, POST /api/articles, GET /api/articles/{id},
 * GET /api/articles/feed, GET /api/articles/subject/{subjectId}
 */
@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    /**
     * Liste paginée de tous les articles par ordre chronologique.
     * 
     * @param page numéro de page (défaut: 0)
     * @param size taille de page (défaut: 20, max: 100)
     * @param sort tri chronologique ("desc" par défaut, "asc" possible)
     * @return Page d'ArticleDTO
     */
    @GetMapping
    public ResponseEntity<Page<ArticleDTO>> getAllArticles(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "desc") String sort) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sort) ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Page<ArticleDTO> articles = articleService.getAllArticles(page, size, direction);
        return ResponseEntity.ok(articles);
    }

    /**
     * Récupère un article par son ID.
     * 
     * @param id ID de l'article
     * @return ArticleDTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<ArticleDTO> getArticleById(@PathVariable Long id) {
        ArticleDTO article = articleService.getArticleById(id);
        return ResponseEntity.ok(article);
    }

    /**
     * Fil d'actualité personnalisé pour l'utilisateur connecté.
     * Articles des sujets auxquels l'utilisateur est abonné.
     * 
     * @param page numéro de page (défaut: 0)
     * @param size taille de page (défaut: 20, max: 100)
     * @return Page d'ArticleDTO du fil personnalisé
     */
    @GetMapping("/feed")
    public ResponseEntity<Page<ArticleDTO>> getPersonalizedFeed(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        String userEmail = SecurityUtils.getCurrentUserEmail();
        Page<ArticleDTO> feed = articleService.getPersonalizedFeed(userEmail, page, size);
        return ResponseEntity.ok(feed);
    }

    /**
     * Articles d'un sujet spécifique par ordre chronologique.
     * 
     * @param subjectId ID du sujet
     * @param page numéro de page (défaut: 0)
     * @param size taille de page (défaut: 20, max: 100)
     * @return Page d'ArticleDTO du sujet
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<Page<ArticleDTO>> getArticlesBySubject(
            @PathVariable Long subjectId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        Page<ArticleDTO> articles = articleService.getArticlesBySubject(subjectId, page, size);
        return ResponseEntity.ok(articles);
    }

    /**
     * Crée un nouvel article.
     * Auteur et date définis automatiquement.
     * 
     * @param articleDTO données de l'article à créer
     * @return ArticleDTO créé avec statut 201
     */
    @PostMapping
    public ResponseEntity<ArticleDTO> createArticle(@Valid @RequestBody ArticleDTO articleDTO) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        ArticleDTO createdArticle = articleService.createArticle(articleDTO, userEmail);
        return new ResponseEntity<>(createdArticle, HttpStatus.CREATED);
    }
}