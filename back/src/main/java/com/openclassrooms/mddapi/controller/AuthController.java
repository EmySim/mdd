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
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

/**
 * Contrôleur REST pour l'authentification des utilisateurs.
 * 
 * Endpoints : POST /api/auth/register, POST /api/auth/login, GET /api/auth/status
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

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@Valid @RequestBody RegisterRequest registerRequest, HttpServletResponse response) {
        log.info("📩 Requête inscription reçue: {}", registerRequest);

        UserDTO userDTO = userService.createUser(registerRequest);
        log.debug("✅ Utilisateur créé: {}", userDTO);

        User user = userRepository.findByEmail(userDTO.getEmail())
                .orElseThrow(() -> {
                    log.error("❌ Utilisateur créé introuvable en DB: {}", userDTO.getEmail());
                    return new EntityNotFoundException("Utilisateur créé introuvable");
                });

        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());
        log.info("🔑 JWT généré pour nouvel utilisateur {}: {}", user.getEmail(), jwt);

        Cookie cookie = new Cookie("jwt", jwt);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // ⚠️ temporaire pour développement local
        cookie.setPath("/");
        cookie.setMaxAge((int) jwtUtils.getJwtExpirationSeconds());
        response.addCookie(cookie);
        log.info("🍪 Cookie JWT ajouté à la réponse pour l'utilisateur {}", user.getEmail());

        JwtResponse jwtResponse = JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .expiresIn(jwtUtils.getJwtExpirationSeconds())
                .build();

        log.debug("📤 Réponse d'inscription envoyée: {}", jwtResponse);
        return ResponseEntity.status(201).body(jwtResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        log.info("📩 Tentative de connexion avec identifiant: {}", loginRequest.getEmailOrUsername());

        User user = userRepository.findByEmail(loginRequest.getEmailOrUsername())
                .or(() -> userRepository.findByUsername(loginRequest.getEmailOrUsername()))
                .orElseThrow(() -> {
                    log.error("❌ Utilisateur non trouvé: {}", loginRequest.getEmailOrUsername());
                    return new EntityNotFoundException("Utilisateur non trouvé");
                });
        log.debug("✅ Utilisateur trouvé: {}", user.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        loginRequest.getPassword()
                )
        );
        log.info("🔐 Authentification réussie pour {}", user.getEmail());

        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());
        log.info("🔑 JWT généré pour {}: {}", user.getEmail(), jwt);

        Cookie cookie = new Cookie("jwt", jwt);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // ⚠️ temporaire pour développement local
        cookie.setPath("/");
        cookie.setMaxAge((int) jwtUtils.getJwtExpirationSeconds());
        response.addCookie(cookie);
        log.info("🍪 Cookie JWT ajouté à la réponse pour l'utilisateur {}", user.getEmail());

        JwtResponse jwtResponse = JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .expiresIn(jwtUtils.getJwtExpirationSeconds())
                .build();

        log.debug("📤 Réponse de connexion envoyée: {}", jwtResponse);
        return ResponseEntity.ok(jwtResponse);
    }

    @GetMapping("/status")
    public ResponseEntity<MessageResponse> getStatus() {
        log.info("📩 Requête de statut du service d'auth");
        long userCount = userService.countAllUsers();
        log.info("✅ Service d'auth OK - {} utilisateurs inscrits", userCount);
        return ResponseEntity.ok(MessageResponse.info("Service d'authentification MDD opérationnel. " + userCount + " utilisateurs inscrits."));
    }
}
