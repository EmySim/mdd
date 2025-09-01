package com.openclassrooms.mddapi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
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
 * Gère les cas de token absent, invalide ou expiré en retournant
 * une réponse JSON cohérente avec le GlobalExceptionHandler.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Gère les erreurs d'authentification JWT.
     * Retourne une réponse JSON 401 avec message d'erreur standardisé.
     * 
     * @param request requête HTTP
     * @param response réponse HTTP
     * @param authException exception d'authentification
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

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