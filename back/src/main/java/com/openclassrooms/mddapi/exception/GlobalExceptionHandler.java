package com.openclassrooms.mddapi.exception;

import com.openclassrooms.mddapi.dto.response.MessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Gestionnaire global des exceptions pour l'API MDD.
 * 
 * ✅ CODES HTTP STANDARDS GÉRÉS :
 * - 400 BAD_REQUEST : Validation, paramètres invalides
 * - 401 UNAUTHORIZED : Authentification échouée
 * - 403 FORBIDDEN : Accès refusé (permissions)
 * - 404 NOT_FOUND : Ressource non trouvée
 * - 409 CONFLICT : Contraintes DB (email déjà pris, etc.)
 * - 500 INTERNAL_SERVER_ERROR : Erreurs système
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ============================================================================
    // 400 BAD_REQUEST - Requêtes malformées / Validation
    // ============================================================================

    /**
     * 400 - Erreurs de validation (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        log.warn("🔴 [400] Erreur de validation: {}", request.getDescription(false));

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage() != null ? error.getDefaultMessage() : "Erreur de validation";
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Validation failed");
        response.put("type", "error");
        response.put("errors", errors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST); // 400
    }

    /**
     * 400 - Paramètres invalides
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
    // 401 UNAUTHORIZED - Authentification échouée
    // ============================================================================

    /**
     * 401 - Email/mot de passe incorrects
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<MessageResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Authentication failed";
        log.warn("🔐 [401] Authentification échouée: {}", exceptionMessage);

        MessageResponse response = MessageResponse.error("Email ou mot de passe incorrect");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED); // 401
    }

    // ============================================================================
    // 403 FORBIDDEN - Accès refusé (permissions insuffisantes)
    // ============================================================================

    /**
     * 403 - Accès refusé (ex: essayer de modifier l'article d'un autre user)
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
     * 404 - Article, User, Subject non trouvé
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<MessageResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Ressource non trouvée";
        log.info("🔍 [404] Ressource non trouvée: {}", exceptionMessage);

        MessageResponse response = MessageResponse.error(exceptionMessage);
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND); // 404
    }

    // ============================================================================
    // 409 CONFLICT - Conflits de données
    // ============================================================================

    /**
     * 409 - Email déjà pris, username déjà pris (contraintes DB)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<MessageResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {

        String errorMsg = ex.getMessage();
        if (errorMsg == null) {
            errorMsg = "Contrainte de base de données violée";
        }
        errorMsg = errorMsg.toLowerCase();
        
        log.warn("🔴 [409] Violation contrainte DB: {}", errorMsg);

        String message;
        if (errorMsg.contains("uk_users_email") || errorMsg.contains("email")) {
            message = "Cet email est déjà utilisé";
        } else if (errorMsg.contains("uk_users_username") || errorMsg.contains("username")) {
            message = "Ce nom d'utilisateur est déjà pris";
        } else if (errorMsg.contains("duplicate") || errorMsg.contains("unique")) {
            message = "Cette donnée existe déjà dans le système";
        } else {
            message = "Erreur de validation des données";
        }

        MessageResponse response = MessageResponse.error(message);
        return new ResponseEntity<>(response, HttpStatus.CONFLICT); // 409
    }

    /**
     * 409 - Conflits business (ex: se désabonner d'un sujet non suivi)
     */
    @ExceptionHandler(BusinessConflictException.class)
    public ResponseEntity<MessageResponse> handleBusinessConflictException(
            BusinessConflictException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Conflit métier";
        log.warn("⚠️ [409] Conflit business: {}", exceptionMessage);

        MessageResponse response = MessageResponse.error(exceptionMessage);
        return new ResponseEntity<>(response, HttpStatus.CONFLICT); // 409
    }

    // ============================================================================
    // 500 INTERNAL_SERVER_ERROR - Erreurs système
    // ============================================================================

    /**
     * 500 - Toutes les autres erreurs non gérées
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponse> handleGlobalException(
            Exception ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Erreur inconnue";
        log.error("💥 [500] Erreur système: {}", exceptionMessage, ex);

        MessageResponse response = MessageResponse.error("Une erreur technique est survenue. Veuillez réessayer.");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR); // 500
    }

    // ============================================================================
    // EXCEPTIONS CUSTOM
    // ============================================================================

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
        
        public ResourceNotFoundException(String resource, Object id) {
            super(String.format("%s avec l'ID '%s' non trouvé(e)", resource, id));
        }
    }

    public static class BusinessConflictException extends RuntimeException {
        public BusinessConflictException(String message) {
            super(message);
        }
    }
}