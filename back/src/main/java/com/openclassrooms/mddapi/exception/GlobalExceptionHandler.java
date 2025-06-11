package com.openclassrooms.mddapi.exception;

import com.openclassrooms.mddapi.dto.response.MessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import javax.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

/**
 * Gestionnaire global des exceptions pour l'API MDD.
 *
 * Intercepte toutes les exceptions et retourne des réponses cohérentes
 * en utilisant MessageResponse avec les statuts HTTP appropriés.
 *
 * @author Équipe MDD
 * @version 1.0
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Gère les erreurs de validation (@Valid sur les DTOs).
     * Retourne un détail des erreurs par champ.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        log.warn("🔴 Erreur de validation: {}", ex.getMessage());

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Validation failed");
        response.put("type", "error");
        response.put("errors", errors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Gère les erreurs d'authentification.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<MessageResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {

        log.warn("🔐 Erreur d'authentification: {}", ex.getMessage());

        MessageResponse response = MessageResponse.error(ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Gère les erreurs de conflit (email déjà utilisé, etc.).
     */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<MessageResponse> handleConflictException(
            ConflictException ex, WebRequest request) {

        log.warn("⚠️ Conflit: {}", ex.getMessage());

        MessageResponse response = MessageResponse.error(ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    /**
     * Gère les erreurs d'arguments invalides.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {

        log.warn("📝 Argument invalide: {}", ex.getMessage());

        MessageResponse response = MessageResponse.error(ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Gère toutes les autres exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponse> handleGlobalException(
            Exception ex, WebRequest request) {

        log.error("💥 Erreur interne: ", ex);

        MessageResponse response = MessageResponse.error("Internal server error");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

/**
 * Exception pour les erreurs d'authentification.
 */
class AuthenticationException extends RuntimeException {
    public AuthenticationException(String message) {
        super(message);
    }
}

/**
 * Exception pour les conflits de données.
 */
class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}