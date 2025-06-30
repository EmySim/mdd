package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour la gestion des sujets.
 *
 * Fournit :
 * - Recherche par nom
 * - Vérification d'existence
 * - Vérification d'abonnement d'un utilisateur
 * - Liste paginée triée par nom
 *
 * Optimisé pour les besoins essentiels liés aux sujets.
 */
@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    /**
     * Recherche un sujet par son nom.
     *
     * @param name Nom du sujet
     * @return Sujet s'il existe
     */
    Optional<Subject> findByName(String name);

    /**
     * Vérifie l'existence d'un sujet par son nom.
     *
     * @param name Nom du sujet
     * @return true si le sujet existe
     */
    boolean existsByName(String name);

    /**
     * Vérifie si un utilisateur est abonné à un sujet.
     *
     * @param subjectId ID du sujet
     * @param userId    ID de l'utilisateur
     * @return true si l'utilisateur est abonné au sujet
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END " +
           "FROM User u JOIN u.subscribedSubjects s " +
           "WHERE u.id = :userId AND s.id = :subjectId")
    boolean isUserSubscribedToSubject(@Param("subjectId") Long subjectId, @Param("userId") Long userId);

    /**
     * Liste paginée des sujets triée par ordre alphabétique.
     *
     * @param pageable Paramètres de pagination
     * @return Page de sujets triés par nom
     */
    Page<Subject> findAllByOrderByNameAsc(Pageable pageable);

    /**
     * Vérifie l'existence d'un sujet par son nom en ignorant la casse.
     *
     * @param name Nom du sujet à vérifier
     * @return true si le sujet existe
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Compte le nombre d'articles pour un sujet spécifique.
     *
     * @param subjectId ID du sujet
     * @return nombre d'articles
     */
    @Query("SELECT COUNT(a) FROM Article a WHERE a.subject.id = :subjectId")
    long countArticlesBySubjectId(@Param("subjectId") Long subjectId);
}
