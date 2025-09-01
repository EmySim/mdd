package com.openclassrooms.mddapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List; 

/**
 * DTO pour User avec support des abonnements aux sujets.
 *
 * Utilisé pour :
 * - Profil utilisateur complet
 * - Mise à jour des informations utilisateur
 * - Affichage des abonnements aux sujets
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    /** ID unique de l'utilisateur */
    private Long id;
    
    /** Nom d'utilisateur */
    private String username;
    
    /** Adresse email */
    private String email;
    
    /** Mot de passe (utilisé uniquement pour les mises à jour) */
    private String password;
    
    /** Date de création du compte */
    private LocalDateTime createdAt;
    
    /** Date de dernière mise à jour */
    private LocalDateTime updatedAt;
    
    /** Liste des sujets auxquels l'utilisateur est abonné */
    private List<SubjectDTO> subscribedSubjects;
}