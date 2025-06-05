package com.openclassrooms.mddapi.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
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
 * @author Équipe MDD
 * @version 1.0
 */
@Component
@Slf4j
public class JwtUtils {

    /**
     * Clé secrète pour signer les tokens JWT.
     */
    @Value("${app.jwt.secret:MddSecretKeyForJWTTokenGeneration2024VerySecureAndLongEnoughForHS256Algorithm}")
    private String jwtSecret;

    /**
     * Durée de validité du token en millisecondes.
     * Par défaut : 24 heures (86400000 ms)
     */
    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpirationMs;

    /**
     * Génère un token JWT pour un utilisateur authentifié.
     */
    public String generateJwtToken(Authentication authentication) {
        if (authentication == null) {
            log.error("❌ Tentative de génération de token avec authentication null");
            throw new IllegalArgumentException("Authentication cannot be null");
        }

        String username = authentication.getName();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        String token = Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        log.info("🔐 Token JWT généré pour: {} | Expire le: {}", username, expiryDate);
        return token;
    }

    /**
     * Génère un token JWT à partir d'un nom d'utilisateur.
     */
    public String generateTokenFromUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            log.error("❌ Username invalide: {}", username);
            throw new IllegalArgumentException("Username cannot be null or empty");
        }

        String cleanUsername = username.trim();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        String token = Jwts.builder()
                .setSubject(cleanUsername)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        log.debug("🎯 Token généré pour: {}", cleanUsername);
        return token;
    }

    /**
     * Extrait le nom d'utilisateur d'un token JWT.
     */
    public String getUserNameFromJwtToken(String token) {
        try {
            String cleanToken = cleanToken(token);

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(cleanToken)
                    .getBody();

            String username = claims.getSubject();
            log.debug("📤 Username extrait: {}", username);
            return username;

        } catch (JwtException e) {
            log.error("❌ Erreur extraction username: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Valide un token JWT.
     */
    public boolean validateJwtToken(String authToken) {
        try {
            String cleanToken = cleanToken(authToken);

            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(cleanToken);

            log.debug("✅ Token JWT valide");
            return true;

        } catch (MalformedJwtException e) {
            log.error("❌ Token JWT malformé: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("⏰ Token JWT expiré: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("❌ Token JWT non supporté: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("❌ Claims JWT vides: {}", e.getMessage());
        } catch (Exception e) {
            log.error("❌ Erreur validation JWT: {}", e.getMessage());
        }

        return false;
    }

    /**
     * Vérifie si un token JWT est expiré.
     */
    public boolean isTokenExpired(String token) {
        try {
            String cleanToken = cleanToken(token);

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(cleanToken)
                    .getBody();

            Date expiration = claims.getExpiration();
            boolean isExpired = expiration.before(new Date());

            log.debug("🕐 Token expiré: {}", isExpired);
            return isExpired;

        } catch (ExpiredJwtException e) {
            log.debug("⏰ Token déjà expiré: {}", e.getMessage());
            return true;
        } catch (JwtException e) {
            log.error("❌ Erreur vérification expiration: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Nettoie le token en supprimant le préfixe "Bearer " si présent.
     */
    private String cleanToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }

    /**
     * Génère la clé de signature sécurisée.
     */
    private SecretKey getSigningKey() {
        String keyString = jwtSecret;
        if (keyString.length() < 32) {
            log.warn("⚠️ Clé JWT trop courte, extension automatique");
            keyString = keyString + "0".repeat(32 - keyString.length());
        }
        return Keys.hmacShaKeyFor(keyString.getBytes());
    }

    /**
     * Retourne la durée de validité en millisecondes.
     */
    public long getJwtExpirationMs() {
        return jwtExpirationMs;
    }

    /**
     * Retourne la durée de validité en secondes.
     */
    public long getJwtExpirationSeconds() {
        return jwtExpirationMs / 1000;
    }
}