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
 * Harmonisé avec GlobalExceptionHandler pour des réponses cohérentes.
 * 
 * @author Équipe MDD
 * @version 2.0
 */
@Component
@Slf4j
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Gère les erreurs d'authentification JWT (token absent/invalide/expiré).
     * Retourne une réponse JSON cohérente avec GlobalExceptionHandler.
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        String requestURI = request.getRequestURI();
        log.warn("🚫 [401] Accès non autorisé: {} - {}", requestURI, authException.getMessage());

        // Configuration réponse HTTP
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");

        // Message cohérent avec GlobalExceptionHandler
        MessageResponse errorResponse = MessageResponse.error("Token d'authentification requis ou invalide");

        // Écriture réponse JSON
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
    }
} 