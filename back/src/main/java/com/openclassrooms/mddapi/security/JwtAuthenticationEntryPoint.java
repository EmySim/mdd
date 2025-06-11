package com.openclassrooms.mddapi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Point d'entrée pour la gestion des erreurs d'authentification JWT.
 *
 * Cette classe intercepte toutes les erreurs d'authentification et retourne
 * une réponse JSON cohérente avec MessageResponse au lieu de la page
 * d'erreur HTML par défaut de Spring Security.
 *
 * Déclenchée quand :
 * - Token JWT absent sur un endpoint protégé
 * - Token JWT invalide ou expiré
 * - Erreur de validation de token
 * - Utilisateur non trouvé pour le token
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Component
@Slf4j
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Méthode appelée lorsqu'une erreur d'authentification se produit.
     *
     * Au lieu de rediriger vers une page de login, cette méthode retourne
     * une réponse JSON avec un statut HTTP 401 Unauthorized.
     *
     * @param request la requête HTTP qui a causé l'erreur
     * @param response la réponse HTTP à configurer
     * @param authException l'exception d'authentification
     * @throws IOException en cas d'erreur d'écriture de la réponse
     * @throws ServletException en cas d'erreur de servlet
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        // Log de l'erreur d'authentification
        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        log.warn("🚫 Accès non autorise detecte:");
        log.warn("   📍 URI: {} {}", method, requestURI);
        log.warn("   🔍 Raison: {}", authException.getMessage());

        // Configuration de la réponse HTTP
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");

        // Création du message d'erreur approprié
        MessageResponse errorResponse = createErrorResponse(request, authException);

        // Écriture de la réponse JSON
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);

        log.debug("📤 Réponse d'erreur envoyée: {}", jsonResponse);
    }

    /**
     * Crée un message d'erreur approprié selon le contexte.
     *
     * @param request la requête HTTP
     * @param authException l'exception d'authentification
     * @return le MessageResponse avec le message d'erreur
     */
    private MessageResponse createErrorResponse(HttpServletRequest request,
                                                AuthenticationException authException) {

        String requestURI = request.getRequestURI();
        String authHeader = request.getHeader("Authorization");

        // Message selon le contexte
        String message;
        String type = "error";

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Pas de token fourni
            message = "Access token is required. Please provide a valid JWT token in the Authorization header.";
            log.debug("🔑 Token manquant pour: {}", requestURI);

        } else if (authHeader.equals("Bearer ") || authHeader.length() <= 7) {
            // Token vide
            message = "Invalid token format. Please provide a valid JWT token.";
            log.debug("🔧 Token mal formé pour: {}", requestURI);

        } else {
            // Token fourni mais invalide/expiré
            message = "Invalid or expired token. Please login again to get a new token.";
            log.debug("⏰ Token invalide/expiré pour: {}", requestURI);
        }

        return MessageResponse.builder()
                .message(message)
                .type(type)
                .build();
    }


}