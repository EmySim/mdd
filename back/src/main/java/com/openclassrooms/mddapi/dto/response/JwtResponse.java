package com.openclassrooms.mddapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de réponse pour l'authentification JWT.
 *
 * Retourné après une connexion réussie, contient :
 * - Le token JWT pour les requêtes authentifiées
 * - Le type de token (Bearer)
 * - Les informations de base de l'utilisateur
 * - La durée de validité du token
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {

    /**
     * Token JWT pour l'authentification.
     * À inclure dans l'header Authorization: Bearer <token> des requêtes suivantes.
     */
    private String token;

    /**
     * Type de token, toujours "Bearer" pour JWT.
     * Utilisé par le frontend pour construire l'header Authorization.
     */
    @Builder.Default
    private String type = "Bearer";

    /**
     * ID unique de l'utilisateur connecté.
     * Utile pour les requêtes frontend nécessitant l'ID user.
     */
    private Long id;

    /**
     * Nom d'utilisateur.
     * Affiché dans l'interface utilisateur.
     */
    private String username;

    /**
     * Adresse email de l'utilisateur.
     * Peut être utilisée pour l'affichage du profil.
     */
    private String email;

    /**
     * Durée de validité du token en secondes.
     * Permet au frontend de gérer l'expiration et le refresh.
     */
    private Long expiresIn;

    /**
     * Constructeur pour créer une réponse JWT avec les informations essentielles.
     * Le type est automatiquement défini à "Bearer".
     *
     * @param token le token JWT généré
     * @param id l'ID de l'utilisateur
     * @param username le nom d'utilisateur
     * @param email l'email de l'utilisateur
     * @param expiresIn la durée de validité en secondes
     */
    public JwtResponse(String token, Long id, String username, String email, Long expiresIn) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.username = username;
        this.email = email;
        this.expiresIn = expiresIn;
    }

    /**
     * Constructeur minimal avec token uniquement.
     * Utilisé pour les cas où seul le token est nécessaire.
     *
     * @param token le token JWT généré
     */
    public JwtResponse(String token) {
        this.token = token;
        this.type = "Bearer";
    }
}