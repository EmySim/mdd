package com.openclassrooms.mddapi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * DTO pour les requêtes de connexion utilisateur.
 *
 * Contient les informations nécessaires pour l'authentification :
 * - Email de l'utilisateur (identifiant unique)
 * - Mot de passe en clair (sera vérifié côté serveur)
 *
 * Validation automatique via Bean Validation.
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    /**
     * Adresse email de l'utilisateur.
     * Utilisée comme identifiant unique pour la connexion.
     */
    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    /**
     * Mot de passe de l'utilisateur en clair.
     * Sera validé contre le hash stocké en base de données.
     */
    @NotBlank(message = "Password is mandatory")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;
}