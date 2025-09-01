package com.openclassrooms.mddapi.exception;

import com.openclassrooms.mddapi.dto.response.MessageResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
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
 * Gère les erreurs de validation, d'authentification, d'autorisation
 * et de contraintes de base de données avec des réponses HTTP appropriées.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Gère les erreurs de validation Bean Validation (400 Bad Request).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage() != null
                    ? error.getDefaultMessage()
                    : "Erreur de validation";
            fieldErrors.put(fieldName, errorMessage);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Validation failed");
        response.put("type", "error");
        response.put("errors", fieldErrors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Gère les arguments invalides (400 Bad Request).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Argument invalide";
        MessageResponse response = MessageResponse.error("Paramètre invalide: " + exceptionMessage);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Gère les erreurs d'identifiants incorrects (401 Unauthorized).
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<MessageResponse> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request) {

        MessageResponse response = MessageResponse.error("Email/nom d'utilisateur ou mot de passe incorrect");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Gère les erreurs d'authentification générales (401 Unauthorized).
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<MessageResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {

        MessageResponse response = MessageResponse.error("Erreur d'authentification");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Gère les accès refusés (403 Forbidden).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<MessageResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {

        MessageResponse response = MessageResponse.error("Vous n'avez pas les permissions pour cette action");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    /**
     * Gère les ressources non trouvées (404 Not Found).
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<MessageResponse> handleEntityNotFoundException(
            EntityNotFoundException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Ressource non trouvée";
        MessageResponse response = MessageResponse.error(exceptionMessage);
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Gère les violations de contraintes de base de données (409 Conflict).
     * Détecte automatiquement les doublons d'email et username.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<MessageResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {

        String errorMsg = ex.getMessage();
        if (errorMsg == null) {
            errorMsg = "Contrainte de base de données violée";
        }
        errorMsg = errorMsg.toLowerCase();

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
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    /**
     * Gère les états métier invalides (409 Conflict).
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<MessageResponse> handleIllegalStateException(
            IllegalStateException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "État invalide";
        MessageResponse response = MessageResponse.error(exceptionMessage);
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    /**
     * Gestionnaire d'exception par défaut (500 Internal Server Error).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponse> handleGlobalException(
            Exception ex, WebRequest request) {

        if (ex instanceof BadCredentialsException) {
            MessageResponse response = MessageResponse.error("Email/nom d'utilisateur ou mot de passe incorrect");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        MessageResponse response = MessageResponse.error(
                "Une erreur technique est survenue. Veuillez réessayer."
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}