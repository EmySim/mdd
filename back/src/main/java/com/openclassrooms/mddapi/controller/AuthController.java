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
import com.openclassrooms.mddapi.exception.GlobalExceptionHandler;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * Contrôleur REST pour l'authentification des utilisateurs MDD.
 *
 * Gère l'inscription et la connexion avec génération de tokens JWT
 * selon les spécifications fonctionnelles du MVP.
 *
 * APPROCHE DB-FIRST
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
     * ✅ DB-FIRST : Save direct, DB rejette les doublons automatiquement
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("🔐 Tentative d'inscription pour email: {}, username: {}",
                registerRequest.getEmail(), registerRequest.getUsername());

        // ✅ DB-FIRST : Construction + save direct
        // Si email/username duplicate → DataIntegrityViolationException → GlobalExceptionHandler
        User user = User.builder()
                .email(registerRequest.getEmail())
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .build();

        User savedUser = userRepository.save(user);

        log.info("✅ Utilisateur créé avec succès - ID: {}, Email: {}, Username: {}",
                savedUser.getId(), savedUser.getEmail(), savedUser.getUsername());

        return ResponseEntity.ok(MessageResponse.success("Inscription réussie"));
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

        // ✅ DB-FIRST : Si auth échoue → AuthenticationException → GlobalExceptionHandler
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        log.debug("🔓 Authentification réussie pour: {}", loginRequest.getEmail());

        // Génération du token JWT
        String jwt = jwtUtils.generateTokenFromUsername(loginRequest.getEmail());

        // Récupération des infos utilisateur
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Utilisateur", loginRequest.getEmail()));

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