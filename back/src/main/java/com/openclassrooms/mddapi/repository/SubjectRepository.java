package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository Subject - CRUD + méthodes métier minimales.
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    /**
     * Trouve un sujet par son nom exact.
     */
    Optional<Subject> findByName(String name);

    /**
     * Vérifie si un sujet existe avec ce nom.
     */
    boolean existsByName(String name);
}