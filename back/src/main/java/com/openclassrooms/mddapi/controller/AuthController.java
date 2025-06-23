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
     * Inscription d'un nouvel utilisateur.
     */
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("🔐 Inscription: {}", registerRequest.getEmail());

        // Délégation au UserService
        UserDTO userDTO = userService.createUser(registerRequest);

        log.info("✅ Inscription réussie: {} (ID: {})", userDTO.getEmail(), "new_user");

        return ResponseEntity.status(201)
                .body(MessageResponse.success("Inscription réussie"));
    }

    /**
     * Connexion utilisateur avec génération de token JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("🔑 Connexion: {}", loginRequest.getEmail());

        // Authentification
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // Génération du token JWT
        String jwt = jwtUtils.generateTokenFromUsername(loginRequest.getEmail());

        // Récupération utilisateur
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
     * Endpoint de santé.
     */
    @GetMapping("/status")
    public ResponseEntity<MessageResponse> getStatus() {
        long userCount = userService.countAllUsers();
        return ResponseEntity.ok(MessageResponse.info("Service d'authentification MDD opérationnel. " + userCount + " utilisateurs inscrits."));
    }
}