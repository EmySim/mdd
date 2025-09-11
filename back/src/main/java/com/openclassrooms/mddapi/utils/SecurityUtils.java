package com.openclassrooms.mddapi.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Classe utilitaire pour la gestion de la sécurité et l'authentification.
 *
 * **RESPONSABILITÉ :** Centralise l'extraction des informations
 * d'authentification depuis le SecurityContext Spring Security.
 *
 * USAGE :
 * - Extraction de l'email utilisateur connecté
 * - Vérification du statut d'authentification
 * - Utilitaires de sécurité réutilisables
 *
 * NOTE : Les exceptions sont gérées par GlobalExceptionHandler
 */
@Slf4j
public final class SecurityUtils {

    /**
     * Constructeur privé pour empêcher l'instanciation.
     * Classe utilitaire avec méthodes statiques uniquement.
     */
    private SecurityUtils() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Récupère l'email de l'utilisateur connecté depuis le SecurityContext.
     *
     * SÉCURITÉ : Extraction de l'identifiant utilisateur via JWT
     * pour définir automatiquement l'auteur des articles/commentaires.
     *
     * @return email de l'utilisateur connecté
     * @throws IllegalStateException si aucun utilisateur n'est authentifié
     *         (géré par GlobalExceptionHandler → 409 CONFLICT)
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Aucun utilisateur authentifié");
        }

        String userEmail = authentication.getName();
        log.debug("🔐 Utilisateur authentifié: {}", userEmail);

        return userEmail;
    }

    /**
     * Vérifie si un utilisateur est authentifié.
     *
     * @return true si un utilisateur est authentifié
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    /**
     * Récupère l'objet Authentication complet.
     * Utile pour des vérifications avancées.
     *
     * @return Authentication ou null si non authentifié
     */
    public static Authentication getCurrentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
}