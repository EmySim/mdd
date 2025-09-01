package com.openclassrooms.mddapi.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utilitaires pour la gestion des tokens JWT dans l'application MDD.
 *
 * Cette classe centralise toutes les opérations liées aux JWT :
 * - Génération de tokens d'authentification
 * - Validation et vérification des tokens
 * - Extraction des informations utilisateur
 * - Gestion de l'expiration et de la sécurité
 *
 */
@Component
@Slf4j
public class JwtUtils {

    /**
     * Clé secrète pour signer les tokens JWT.
     * Configurée via application.properties
     */
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    /**
     * Durée de validité du token en millisecondes.
     * Configurée via application.properties
     */
    @Value("${app.jwt.expiration}")
    private long jwtExpirationMs;

    // --- Opérations de base sur les tokens ---

    /**
     * Génère un token JWT pour un utilisateur authentifié.
     * @param authentication L'objet d'authentification contenant les informations de l'utilisateur.
     * @return Le token JWT généré.
     */
    public String generateJwtToken(Authentication authentication) {
        // On s'assure que l'objet d'authentification n'est pas nul.
        if (authentication == null) {
            throw new IllegalArgumentException("L'objet d'authentification ne peut pas être nul.");
        }
        return generateTokenFromUsername(authentication.getName());
    }

    /**
     * Génère un token JWT à partir d'un nom d'utilisateur.
     * @param username Le nom d'utilisateur à inclure dans le token.
     * @return Le token JWT généré.
     */
    public String generateTokenFromUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom d'utilisateur ne peut pas être nul ou vide.");
        }

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(username.trim())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // --- Analyse et validation des tokens ---

    /**
     * Extrait le nom d'utilisateur d'un token JWT.
     * @param token Le token JWT complet, incluant potentiellement le préfixe "Bearer ".
     * @return Le nom d'utilisateur ou null si le token est invalide.
     */
    public String getUserNameFromJwtToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(cleanToken(token))
                    .getBody()
                    .getSubject();
        } catch (JwtException e) {
            // Journalise l'exception pour comprendre pourquoi l'analyse a échoué
            log.error("Token JWT invalide : {}", e.getMessage());
            return null; // Retourne null au lieu de relancer une exception générique
        }
    }

    /**
     * Valide un token JWT en vérifiant sa signature et son expiration.
     * @param authToken Le token à valider.
     * @return true si le token est valide, false sinon.
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(cleanToken(authToken));
            return true;
        } catch (MalformedJwtException e) {
            log.error("Token JWT malformé : {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Token JWT expiré : {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Token JWT non supporté : {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("Chaîne de claims JWT vide : {}", e.getMessage());
        } catch (SignatureException e) {
            log.error("Signature JWT invalide : {}", e.getMessage());
        } catch (Exception e) {
            log.error("Une erreur inattendue s'est produite lors de la validation du token : {}", e.getMessage());
        }
        return false;
    }

    // --- Méthodes utilitaires ---

    /**
     * Génère la clé de signature sécurisée à partir de la chaîne de caractères.
     * @return La clé secrète.
     */
    private SecretKey getSigningKey() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalArgumentException("Le secret JWT ne peut pas être nul ou vide.");
        }
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Nettoie le token en supprimant le préfixe "Bearer " si présent.
     * @param token Le token avec ou sans préfixe.
     * @return Le token nettoyé.
     */
    private String cleanToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }

    // --- Getters pour les propriétés de configuration ---

    /**
     * Retourne la durée de validité en millisecondes.
     * @return La durée en ms.
     */
    public long getJwtExpirationMs() {
        return jwtExpirationMs;
    }

    /**
     * Retourne la durée de validité en secondes.
     * @return La durée en secondes.
     */
    public long getJwtExpirationSeconds() {
        return jwtExpirationMs / 1000;
    }
}