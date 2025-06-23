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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityNotFoundException;
import javax.validation.Valid;

/**
 * Contrôleur REST pour l'authentification des utilisateurs MDD.
 * 
 * Approche DB-FIRST : sauvegarde directe, la DB gère les contraintes.
 * Erreurs interceptées par GlobalExceptionHandler pour réponses cohérentes.
 * 
 * Endpoints publics :
 * - POST /api/auth/register : Inscription nouvel utilisateur
 * - POST /api/auth/login : Connexion avec JWT
 * 
 * @author Équipe MDD
 * @version 2.0
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    private final JwtUtils jwtUtils;

    /**
     * Inscription d'un nouvel utilisateur.
     * DB-FIRST : save direct, GlobalExceptionHandler gère les doublons (409).
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("🔐 Inscription: {}", registerRequest.getEmail());



        return ResponseEntity.ok(MessageResponse.success("Inscription réussie"));
    }

    /**
     * Connexion utilisateur avec génération de token JWT.
     * AuthenticationManager gère la validation, GlobalExceptionHandler gère les erreurs (401).
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("🔑 Connexion: {}", loginRequest.getEmail());

        // Authentification - Si échec → AuthenticationException → GlobalExceptionHandler (401)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // Génération du token JWT
        String jwt = jwtUtils.generateTokenFromUsername(loginRequest.getEmail());

        // Récupération utilisateur - Si absent → EntityNotFoundException → GlobalExceptionHandler (404)
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));

        log.info("✅ Connexion réussie: {} (ID: {})", user.getEmail(), user.getId());

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
     * Endpoint de santé pour vérifier le service d'authentification.
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        return ResponseEntity.ok(MessageResponse.info("Service d'authentification MDD opérationnel"));
    }
}