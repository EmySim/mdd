package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour la gestion des utilisateurs en base de données.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Recherche un utilisateur par son adresse email.
     */
    Optional<User> findByEmail(String email);

    /**
     * Recherche un utilisateur par son nom d'utilisateur.
     */
    Optional<User> findByUsername(String username);

}