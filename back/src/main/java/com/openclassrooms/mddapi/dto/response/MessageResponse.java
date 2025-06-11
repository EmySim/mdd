package com.openclassrooms.mddapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO générique pour les messages de réponse de l'API.
 *
 * Utilisé pour :
 * - Messages de succès (inscription réussie, etc.)
 * - Messages d'erreur (validation, authentification, etc.)
 * - Messages d'information généraux
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    /**
     * Message à afficher à l'utilisateur.
     */
    private String message;

    /**
     * Type de message (success, error, info, warning).
     * Permet au frontend d'adapter l'affichage.
     */
    private String type;

    /**
     * Constructeur simple pour un message basique.
     *
     * @param message le message à afficher
     */
    public MessageResponse(String message) {
        this.message = message;
        this.type = "info";
    }

    /**
     * Factory method pour créer un message de succès.
     *
     * @param message le message de succès
     * @return MessageResponse configuré pour le succès
     */
    public static MessageResponse success(String message) {
        return new MessageResponse(message, "success");
    }

    /**
     * Factory method pour créer un message d'erreur.
     *
     * @param message le message d'erreur
     * @return MessageResponse configuré pour l'erreur
     */
    public static MessageResponse error(String message) {
        return new MessageResponse(message, "error");
    }

    /**
     * Factory method pour créer un message d'information.
     *
     * @param message le message d'information
     * @return MessageResponse configuré pour l'information
     */
    public static MessageResponse info(String message) {
        return new MessageResponse(message, "info");
    }
}