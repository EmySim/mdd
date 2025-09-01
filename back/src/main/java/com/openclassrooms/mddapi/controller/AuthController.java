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
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityNotFoundException;
import javax.validation.Valid;

/**
 * Contrôleur REST pour l'authentification des utilisateurs.
 * 
 * Endpoints : POST /api/auth/register, POST /api/auth/login, GET /api/auth/status
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final UserService userService;

    /**
     * Inscription d'un nouvel utilisateur avec auto-connexion.
     * 
     * @param registerRequest données d'inscription
     * @return JwtResponse avec token et informations utilisateur
     */
    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        // Création de l'utilisateur
        UserDTO userDTO = userService.createUser(registerRequest);

        // Récupération de l'entité User pour le JWT
        User user = userRepository.findByEmail(userDTO.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur créé introuvable"));

        // Génération du token JWT (auto-connexion)
        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());

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
     * Accepte email ou username comme identifiant.
     * 
     * @param loginRequest identifiants de connexion
     * @return JwtResponse avec token et informations utilisateur
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        // Recherche utilisateur par email ou username
        User user = userRepository.findByEmail(loginRequest.getEmailOrUsername())
                .or(() -> userRepository.findByUsername(loginRequest.getEmailOrUsername()))
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));

        // Authentification
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // Génération du token JWT
        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());

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
     * Endpoint de santé du service d'authentification.
     * 
     * @return MessageResponse avec statut et nombre d'utilisateurs
     */
    @GetMapping("/status")
    public ResponseEntity<MessageResponse> getStatus() {
        long userCount = userService.countAllUsers();
        return ResponseEntity.ok(MessageResponse.info("Service d'authentification MDD opérationnel. " + userCount + " utilisateurs inscrits."));
    }
} 