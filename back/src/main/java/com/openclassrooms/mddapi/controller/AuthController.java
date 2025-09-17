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
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

/**
 * Contrôleur REST pour l'authentification des utilisateurs.
 *
 * <p>Endpoints disponibles :</p>
 * <ul>
 *     <li>POST /api/auth/register : Inscription d'un nouvel utilisateur.</li>
 *     <li>POST /api/auth/login : Authentification d'un utilisateur existant.</li>
 *     <li>GET /api/auth/status : Vérifie le statut du service d'authentification.</li>
 * </ul>
 *
 * <p>Le JWT est stocké dans un cookie HttpOnly et n'est pas géré côté frontend.</p>
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
     * Inscrit un nouvel utilisateur.
     *
     * <p>Crée l'utilisateur en base, génère un JWT et le place dans un cookie HttpOnly.</p>
     *
     * @param registerRequest DTO contenant email, username et mot de passe
     * @param response        HttpServletResponse pour ajouter le cookie JWT
     * @return ResponseEntity avec le JWT et les informations de l'utilisateur
     * @throws EntityNotFoundException si l'utilisateur nouvellement créé n'est pas retrouvé en base
     */
    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@Valid @RequestBody RegisterRequest registerRequest, HttpServletResponse response) {
        UserDTO userDTO = userService.createUser(registerRequest);

        User user = userRepository.findByEmail(userDTO.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur créé introuvable"));

        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());

        Cookie cookie = new Cookie("jwt", jwt);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // temporaire pour dev local
        cookie.setPath("/");
        cookie.setMaxAge((int) jwtUtils.getJwtExpirationSeconds());
        response.addCookie(cookie);

        JwtResponse jwtResponse = JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .expiresIn(jwtUtils.getJwtExpirationSeconds())
                .build();

        return ResponseEntity.status(201).body(jwtResponse);
    }

    /**
     * Authentifie un utilisateur existant.
     *
     * <p>Vérifie les identifiants, génère un JWT et le place dans un cookie HttpOnly.</p>
     *
     * @param loginRequest DTO contenant email ou username et mot de passe
     * @param response     HttpServletResponse pour ajouter le cookie JWT
     * @return ResponseEntity avec le JWT et les informations de l'utilisateur
     * @throws EntityNotFoundException si l'utilisateur n'existe pas
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        User user = userRepository.findByEmail(loginRequest.getEmailOrUsername())
                .or(() -> userRepository.findByUsername(loginRequest.getEmailOrUsername()))
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), loginRequest.getPassword())
        );

        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());

        Cookie cookie = new Cookie("jwt", jwt);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // temporaire pour dev local
        cookie.setPath("/");
        cookie.setMaxAge((int) jwtUtils.getJwtExpirationSeconds());
        response.addCookie(cookie);

        JwtResponse jwtResponse = JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .expiresIn(jwtUtils.getJwtExpirationSeconds())
                .build();

        return ResponseEntity.ok(jwtResponse);
    }

    /**
     * Vérifie le statut du service d'authentification.
     *
     * <p>Permet de tester si le service fonctionne et retourne le nombre d'utilisateurs inscrits.</p>
     *
     * @return ResponseEntity contenant un message d'information
     */
    @GetMapping("/status")
    public ResponseEntity<MessageResponse> getStatus() {
        long userCount = userService.countAllUsers();
        return ResponseEntity.ok(MessageResponse.info(
                "Service d'authentification MDD opérationnel. " + userCount + " utilisateurs inscrits."
        ));
    }
}
