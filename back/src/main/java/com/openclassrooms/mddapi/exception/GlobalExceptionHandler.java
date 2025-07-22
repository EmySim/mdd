package com.openclassrooms.mddapi.exception;

import com.openclassrooms.mddapi.dto.response.MessageResponse;
import lombok.extern.slf4j.Slf4j;
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

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        log.warn("🔴 [400] Validation échouée: {}", request.getDescription(false));

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

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Argument invalide";
        log.warn("📝 [400] Argument invalide: {}", exceptionMessage);

        MessageResponse response = MessageResponse.error("Paramètre invalide: " + exceptionMessage);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<MessageResponse> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request) {

        log.error("🚫 [401] Identifiants incorrects: {} - {}", request.getDescription(false), ex.getMessage());

        MessageResponse response = MessageResponse.error("Email/nom d'utilisateur ou mot de passe incorrect");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<MessageResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {

        log.error("🚫 [401] Erreur d'authentification: {} - {}", ex.getClass().getSimpleName(), ex.getMessage());

        MessageResponse response = MessageResponse.error("Erreur d'authentification");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<MessageResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Access denied";
        log.warn("🚫 [403] Accès refusé: {}", exceptionMessage);

        MessageResponse response = MessageResponse.error("Vous n'avez pas les permissions pour cette action");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<MessageResponse> handleEntityNotFoundException(
            EntityNotFoundException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Ressource non trouvée";
        log.info("🔍 [404] Ressource non trouvée: {}", exceptionMessage);

        MessageResponse response = MessageResponse.error(exceptionMessage);
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<MessageResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {

        String errorMsg = ex.getMessage();
        if (errorMsg == null) {
            errorMsg = "Contrainte de base de données violée";
        }
        errorMsg = errorMsg.toLowerCase();

        log.warn("🔴 [409] Contrainte DB violée: {}", errorMsg);

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

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<MessageResponse> handleIllegalStateException(
            IllegalStateException ex, WebRequest request) {

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "État invalide";
        log.warn("⚠️ [409] Conflit business: {}", exceptionMessage);

        MessageResponse response = MessageResponse.error(exceptionMessage);
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponse> handleGlobalException(
            Exception ex, WebRequest request) {

        // Correction : log [500] déplacé après le test BadCredentialsException
        if (ex instanceof BadCredentialsException) {
            log.error("🚫 [401] Identifiants incorrects: {}", request.getDescription(false));
            MessageResponse response = MessageResponse.error("Email/nom d'utilisateur ou mot de passe incorrect");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Erreur inconnue";
        log.error("💥 [500] Erreur système: {}", exceptionMessage, ex);

        MessageResponse response = MessageResponse.error(
                "Une erreur technique est survenue. Veuillez réessayer."
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}