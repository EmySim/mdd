package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


/**
 * Repository Article - Accès aux données selon spécifications MDD.
 *
 * **RESPONSABILITÉ** : CRUD simple et méthodes de base uniquement.
 * Pas de logique métier complexe.
 *
 * MÉTHODES SIMPLES :
 * - CRUD de base (hérité de JpaRepository)
 * - Recherche par champ unique avec tri
 * - Pas de @Query complexes (logique dans le Service)
 *
 * PERFORMANCE :
 * - Utilise les méthodes Spring Data automatiques
 * - Exploite les index DB existants
 * - Pagination systématique
 */
@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    Page<Article> findBySubjectIdOrderByCreatedAtDesc(Long subjectId, Pageable pageable);

    @Query("SELECT a FROM Article a " +
            "WHERE a.subject IN (" +
            "  SELECT s FROM User u JOIN u.subscribedSubjects s " +
            "  WHERE u.id = :userId" +
            ") " +
            "ORDER BY a.createdAt DESC")
    Page<Article> findPersonalizedFeed(@Param("userId") Long userId, Pageable pageable);
}
