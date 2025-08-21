package com.openclassrooms.mddapi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/**
 * DTO pour les requêtes d'inscription utilisateur.
 *
 * Contient toutes les informations nécessaires pour créer un nouveau compte :
 * - Username unique (3-20 caractères, lettres/chiffres/tirets/underscores)
 * - Email unique et valide
 * - Mot de passe sécurisé (8+ caractères, majuscule, minuscule, chiffre)
 *
 * Toutes les validations sont gérées automatiquement par Bean Validation.
 * Les erreurs sont interceptées par GlobalExceptionHandler.
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    /**
     * Nom d'utilisateur unique.
     *
     * Contraintes :
     * - Obligatoire (non vide)
     * - 3 à 20 caractères
     * - Lettres, chiffres, tirets et underscores uniquement
     * - Sera vérifié côté serveur pour l'unicité
     */
    @NotBlank(message = "Username is mandatory")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$",
            message = "Username can only contain letters, numbers, hyphens and underscores")
    private String username;

    /**
     * Adresse email de l'utilisateur.
     *
     * Contraintes :
     * - Obligatoire (non vide)
     * - Format email valide
     * - Maximum 100 caractères
     * - Sera vérifié côté serveur pour l'unicité
     */
    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    /**
     * Mot de passe de l'utilisateur.
     *
     * Contraintes de sécurité :
     * - Obligatoire (non vide)
     * - 8 à 100 caractères
     * - Au moins une lettre minuscule
     * - Au moins une lettre majuscule
     * - Au moins un chiffre
     * - Sera hashé côté serveur avant stockage
     */
    @NotBlank(message = "Password is mandatory")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
            message = "Password must contain at least one lowercase letter, one uppercase letter and one digit")
    private String password;
}