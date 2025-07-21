package com.openclassrooms.mddapi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * DTO pour les requêtes de connexion utilisateur.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    /**
     * Email ou nom d'utilisateur.
     */
    @NotBlank(message = "Email or username is mandatory")
    @Size(max = 100, message = "Email or username must not exceed 100 characters")
    private String emailOrUsername;

    /**
     * Mot de passe de l'utilisateur en clair.
     */
    @NotBlank(message = "Password is mandatory")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;
}