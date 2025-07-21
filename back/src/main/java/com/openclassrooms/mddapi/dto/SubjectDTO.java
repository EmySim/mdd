package com.openclassrooms.mddapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO pour Subject - MVP STRICT.
 *
 * **FONCTIONNALITÉS MVP UNIQUEMENT :**
 * - Affichage des sujets
 * - Statut d'abonnement (pour bouton S'abonner/Se désabonner)
 * - Liste des abonnés
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDTO {

    /**
     * ID du sujet.
     */
    private Long id;

    /**
     * Nom du sujet - UNIQUE.
     * Exemples : "Java", "Angular", "DevOps"
     */
    @NotBlank(message = "Le nom du sujet est obligatoire")
    @Size(max = 100, message = "Le nom du sujet ne peut pas dépasser 100 caractères")
    private String name;

    private String description;

    /**
     * Date de création.
     */
    private LocalDateTime createdAt;

    /**
     * Indique si l'utilisateur connecté est abonné à ce sujet.
     * Utilisé pour afficher le bon bouton (S'abonner/Se désabonner).
     */
    private Boolean isSubscribed;

    /**
     * Liste des emails des utilisateurs abonnés à ce sujet.
     * Utilisé pour les statistiques et la gestion des abonnements.
     */
    private Set<String> subscribers;

    /**
     * Nombre total d'abonnés à ce sujet.
     * Calculé automatiquement à partir de la liste des abonnements.
     */
    private Integer subscriberCount;

    /**
     * Constructeur pour création.
     */
    public SubjectDTO(String name) {
        this.name = name;
    }
}