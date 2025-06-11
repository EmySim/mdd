package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.request.LoginRequest;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.dto.response.JwtResponse;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
import com.openclassrooms.mddapi.entity.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import com.openclassrooms.mddapi.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * Contrôleur REST pour l'authentification des utilisateurs MDD.
 *
 * Gère l'inscription et la connexion avec génération de tokens JWT
 * selon les spécifications fonctionnelles du MVP.
 *
 * Endpoints publics :
 * - POST /api/auth/register : Inscription nouvel utilisateur
 * - POST /api/auth/login : Connexion avec JWT
 *
 * @author Équipe MDD
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    /**
     * Inscription d'un nouvel utilisateur.
     *
     * Vérifie l'unicité de l'email et du username puis crée le compte
     * avec mot de passe encodé. Conforme aux spécifications MVP.
     *
     * @param registerRequest données d'inscription validées
     * @return message de succès ou d'erreur
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("🔐 Tentative d'inscription pour email: {}, username: {}",
                registerRequest.getEmail(), registerRequest.getUsername());

        // Vérification unicité email
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            log.warn("❌ Email déjà existant: {}", registerRequest.getEmail());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Cet email est déjà utilisé"));
        }

        // Vérification unicité username
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            log.warn("❌ Username déjà existant: {}", registerRequest.getUsername());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Ce nom d'utilisateur est déjà pris"));
        }

        try {
            // Création du nouvel utilisateur
            User user = User.builder()
                    .email(registerRequest.getEmail())
                    .username(registerRequest.getUsername())
                    .password(passwordEncoder.encode(registerRequest.getPassword()))
                    .build();

            User savedUser = userRepository.save(user);

            log.info("✅ Utilisateur créé avec succès - ID: {}, Email: {}, Username: {}",
                    savedUser.getId(), savedUser.getEmail(), savedUser.getUsername());

            return ResponseEntity.ok(MessageResponse.success("Inscription réussie"));

        } catch (Exception e) {
            log.error("💥 Erreur lors de l'inscription: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(MessageResponse.error("Erreur lors de l'inscription"));
        }
    }

    /**
     * Connexion utilisateur avec génération de token JWT.
     *
     * Authentifie l'utilisateur et retourne un JWT pour les requêtes
     * suivantes. La session persiste via le token côté client.
     *
     * @param loginRequest email et mot de passe
     * @return token JWT + informations utilisateur ou erreur
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("🔑 Tentative de connexion pour email: {}", loginRequest.getEmail());

        try {
            // Authentification Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Génération du token JWT
            String jwt = jwtUtils.generateTokenFromUsername(loginRequest.getEmail());

            // Récupération des infos utilisateur
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé après authentification"));

            log.info("✅ Connexion réussie - ID: {}, Email: {}, Username: {}",
                    user.getId(), user.getEmail(), user.getUsername());

            // Réponse avec token et infos utilisateur
            return ResponseEntity.ok(JwtResponse.builder()
                    .token(jwt)
                    .type("Bearer")
                    .id(user.getId())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .expiresIn(jwtUtils.getJwtExpirationSeconds())
                    .build());

        } catch (AuthenticationException e) {
            log.warn("❌ Échec authentification pour email: {} - Raison: {}",
                    loginRequest.getEmail(), e.getMessage());

            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Email ou mot de passe incorrect"));

        } catch (Exception e) {
            log.error("💥 Erreur lors de la connexion: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(MessageResponse.error("Erreur lors de la connexion"));
        }
    }

    /**
     * Test de santé du service d'authentification.
     * Endpoint simple pour vérifier que l'API fonctionne.
     *
     * @return statut du service
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        log.debug("📊 Vérification du statut du service d'authentification");
        return ResponseEntity.ok(MessageResponse.info("Service d'authentification MDD opérationnel"));
    }
}