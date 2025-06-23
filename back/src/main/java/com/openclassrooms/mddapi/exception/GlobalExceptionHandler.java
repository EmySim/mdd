package com.openclassrooms.mddapi.exception;

import com.openclassrooms.mddapi.dto.response.MessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import javax.persistence.EntityNotFoundException;
import java.util.HashMap;
import java.util.Map;

/**
 * Gestionnaire global des exceptions pour l'API MDD.
 * 
 * Intercepte toutes les exceptions et retourne des réponses HTTP cohérentes.
 * Utilise les exceptions Java standard : EntityNotFoundException, IllegalStateException, etc.
 * Codes gérés : 400 (validation), 403 (permissions), 404 (not found), 409 (conflit), 500 (erreur système).
 * Note: Les erreurs 401 sont gérées par JwtAuthenticationEntryPoint dans SecurityConfig.
 * 
 * @author Équipe MDD
 * @version 2.0
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ============================================================================
    // 400 BAD_REQUEST - Validation
    // ============================================================================

    /**
     * Gère les erreurs de validation des DTOs (@Valid).
     * Intercepte les erreurs Bean Validation et retourne le détail par champ.
     *
     * @param ex l'exception de validation
     * @param request la requête HTTP
     * @return ResponseEntity avec erreurs par champ et statut 400
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        log.warn("🔴 [400] Validation échouée: {}", request.getDescription(false));

        // Extraction des erreurs par champ
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage() != null
                    ? error.getDefaultMessage()
                    : "Erreur de validation";
            fieldErrors.put(fieldName, errorMessage);
        });

        // Construction de la réponse avec détail des erreurs
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Validation failed");
        response.put("type", "error");
        response.put("errors", fieldErrors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST); // 400
    }

    /**
     * Gère les arguments invalides ou paramètres incorrects.
     *
     * @param ex l'exception contenant le message d'erreur
     * @param request la requête HTTP
     * @return ResponseEntity avec message d'erreur et statut 400
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Argument invalide";
        log.warn("📝 [400] Argument invalide: {}", exceptionMessage);

        MessageResponse response = MessageResponse.error("Paramètre invalide: " + exceptionMessage);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST); // 400
    }

    // ============================================================================
    // 401 UNAUTHORIZED - Gestion déléguée à JwtAuthenticationEntryPoint
    // ============================================================================
    
    // Note: Les erreurs 401 sont gérées par JwtAuthenticationEntryPoint
    // configuré dans SecurityConfig pour une gestion cohérente JWT

    // ============================================================================
    // 403 FORBIDDEN - Permissions
    // ============================================================================

    /**
     * Gère les refus d'accès pour permissions insuffisantes.
     * Ex: modifier l'article d'un autre utilisateur.
     *
     * @param ex l'exception d'accès refusé
     * @param request la requête HTTP
     * @return ResponseEntity avec message d'erreur et statut 403
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<MessageResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Access denied";
        log.warn("🚫 [403] Accès refusé: {}", exceptionMessage);

        MessageResponse response = MessageResponse.error("Vous n'avez pas les permissions pour cette action");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN); // 403
    }

    // ============================================================================
    // 404 NOT_FOUND - Ressource non trouvée
    // ============================================================================

    /**
     * Gère les erreurs de ressources non trouvées.
     * Usage: User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));
     *
     * @param ex l'exception contenant le message d'erreur
     * @param request la requête HTTP
     * @return ResponseEntity avec message d'erreur et statut 404
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<MessageResponse> handleEntityNotFoundException(
            EntityNotFoundException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Ressource non trouvée";
        log.info("🔍 [404] Ressource non trouvée: {}", exceptionMessage);

        MessageResponse response = MessageResponse.error(exceptionMessage);
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND); // 404
    }

    // ============================================================================
    // 409 CONFLICT - Conflits
    // ============================================================================

    /**
     * Gère les violations de contraintes de base de données.
     * Analyse le message d'erreur DB pour retourner un message utilisateur compréhensible.
     *
     * @param ex l'exception de violation de contrainte
     * @param request la requête HTTP
     * @return ResponseEntity avec message adapté et statut 409
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<MessageResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {

        String errorMsg = ex.getMessage();
        if (errorMsg == null) {
            errorMsg = "Contrainte de base de données violée";
        }
        errorMsg = errorMsg.toLowerCase();

        log.warn("🔴 [409] Contrainte DB violée: {}", errorMsg);

        // Analyse du message d'erreur pour déterminer la cause
        String userMessage;
        if (errorMsg.contains("uk_users_email") || errorMsg.contains("email")) {
            userMessage = "Cet email est déjà utilisé";
        } else if (errorMsg.contains("uk_users_username") || errorMsg.contains("username")) {
            userMessage = "Ce nom d'utilisateur est déjà pris";
        } else if (errorMsg.contains("duplicate") || errorMsg.contains("unique")) {
            userMessage = "Cette donnée existe déjà dans le système";
        } else {
            userMessage = "Erreur de validation des données";
        }

        MessageResponse response = MessageResponse.error(userMessage);
        return new ResponseEntity<>(response, HttpStatus.CONFLICT); // 409
    }

    /**
     * Gère les conflits métier de l'application.
     * Ex: se désabonner d'un sujet non suivi, s'abonner à un sujet déjà suivi.
     *
     * @param ex l'exception de conflit métier
     * @param request la requête HTTP
     * @return ResponseEntity avec message métier et statut 409
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<MessageResponse> handleIllegalStateException(
            IllegalStateException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "État invalide";
        log.warn("⚠️ [409] Conflit business: {}", exceptionMessage);

        MessageResponse response = MessageResponse.error(exceptionMessage);
        return new ResponseEntity<>(response, HttpStatus.CONFLICT); // 409
    }

    // ============================================================================
    // 500 INTERNAL_SERVER_ERROR - Erreurs système
    // ============================================================================

    /**
     * Gestionnaire de fallback pour toutes les erreurs non gérées.
     * Retourne un message générique et logge les détails pour investigation.
     *
     * @param ex l'exception non gérée
     * @param request la requête HTTP
     * @return ResponseEntity avec message générique et statut 500
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponse> handleGlobalException(
            Exception ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Erreur inconnue";
        log.error("💥 [500] Erreur système: {}", exceptionMessage, ex);

        // Message générique pour éviter l'exposition d'informations sensibles
        MessageResponse response = MessageResponse.error(
                "Une erreur technique est survenue. Veuillez réessayer."
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR); // 500
    }
}