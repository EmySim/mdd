package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.UserDTO;
import com.openclassrooms.mddapi.dto.request.LoginRequest;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.dto.response.JwtResponse;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
import com.openclassrooms.mddapi.entity.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import com.openclassrooms.mddapi.security.JwtUtils;
import com.openclassrooms.mddapi.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityNotFoundException;
import javax.validation.Valid;

/**
 * Contrôleur REST pour l'authentification des utilisateurs MDD.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final UserService userService;

    /**
     * Inscription d'un nouvel utilisateur avec auto-connexion.
     */
    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("🔐 Inscription: {}", registerRequest.getEmail());

        // 1. Création de l'utilisateur
        UserDTO userDTO = userService.createUser(registerRequest);

        // 2. Récupération de l'entité User pour le JWT
        User user = userRepository.findByEmail(userDTO.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur créé introuvable"));

        // 3. Génération du token JWT (auto-connexion)
        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());

        log.info("✅ Inscription réussie avec auto-connexion: {} (ID: {})", user.getEmail(), user.getId());

        // 4. Même structure de réponse que /login
        return ResponseEntity.status(201).body(JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .expiresIn(jwtUtils.getJwtExpirationSeconds())
                .build());
    }

    /**
     * Connexion utilisateur avec génération de token JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("🔑 Connexion: {}", loginRequest.getEmailOrUsername());

        // Recherche utilisateur par email ou username
        User user = userRepository.findByEmail(loginRequest.getEmailOrUsername())
                .or(() -> userRepository.findByUsername(loginRequest.getEmailOrUsername()))
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));

        // Authentification
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(), // Toujours utiliser l'email pour le token
                        loginRequest.getPassword()
                )
        );

        // Génération du token JWT
        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());

        log.info("✅ Connexion reussie: {} (ID: {})", user.getEmail(), user.getId());

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
     * Endpoint de santé.
     */
    @GetMapping("/status")
    public ResponseEntity<MessageResponse> getStatus() {
        long userCount = userService.countAllUsers();
        return ResponseEntity.ok(MessageResponse.info("Service d'authentification MDD opérationnel. " + userCount + " utilisateurs inscrits."));
    }
}