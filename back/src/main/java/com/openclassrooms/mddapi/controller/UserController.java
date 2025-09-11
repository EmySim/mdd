package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.UserDTO;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
import com.openclassrooms.mddapi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * Contrôleur REST pour la gestion du profil utilisateur.
 *
 * Endpoints : GET /api/user/{id}, GET /api/user/profile, PUT /api/user/{id}, POST /api/user/logout
 *
 * @author Équipe MDD
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    /**
     * Récupère le profil de l'utilisateur connecté en utilisant le JWT.
     * Cette méthode ne requiert pas l'ID dans l'URL.
     * Le backend extrait l'email de l'utilisateur du contexte de sécurité (issu du token JWT).
     *
     * @return ResponseEntity contenant un UserDTO avec le profil et les abonnements de l'utilisateur.
     */
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getCurrentUserProfile() {
        log.info("ℹ️ Tentative de récupération du profil utilisateur via le token JWT");
        try {
            String email = getCurrentUserEmail();
            log.debug("✅ Email de l'utilisateur authentifié trouvé: {}", email);
            UserDTO userProfile = userService.getUserProfileWithSubscriptions(email);
            log.info("✅ Profil de l'utilisateur {} récupéré avec succès.", email);
            return ResponseEntity.ok(userProfile);
        } catch (IllegalStateException e) {
            log.error("❌ Erreur d'authentification: {}", e.getMessage());
            // Retourne une réponse non autorisée si l'utilisateur n'est pas authentifié
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération du profil: {}", e.getMessage(), e);
            // Retourne une erreur interne du serveur pour les autres exceptions
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Récupère le profil de l'utilisateur connecté avec ses abonnements.
     *
     * @param id ID de l'utilisateur
     * @return UserDTO avec profil et abonnements
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserProfileById(@PathVariable("id") Long id) {
        log.info("ℹ️ Tentative de récupération du profil utilisateur avec l'ID: {}", id);
        String email = getCurrentUserEmail();
        UserDTO userProfile = userService.getUserProfileWithSubscriptions(email);
        log.info("✅ Profil de l'utilisateur {} récupéré par ID.", email);
        return ResponseEntity.ok(userProfile);
    }

    /**
     * Met à jour le profil de l'utilisateur connecté.
     *
     * @param id ID de l'utilisateur
     * @param updateRequest données de mise à jour
     * @return UserDTO mis à jour
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateCurrentUserProfile(@PathVariable("id") Long id, @Valid @RequestBody UserDTO updateRequest) {
        log.info("ℹ️ Tentative de mise à jour du profil utilisateur avec l'ID: {}", id);
        String email = getCurrentUserEmail();
        UserDTO updatedUser = userService.updateUserProfile(email, updateRequest);
        log.info("✅ Profil de l'utilisateur {} mis à jour.", email);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Déconnexion de l'utilisateur.
     *
     * @return MessageResponse de confirmation
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
        log.info("ℹ️ Demande de déconnexion reçue.");
        return ResponseEntity.ok(MessageResponse.success("Déconnexion réussie"));
    }

    /**
     * Récupère l'email de l'utilisateur connecté depuis le SecurityContext.
     *
     * @return email de l'utilisateur authentifié
     */
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Aucun utilisateur authentifié");
        }

        return authentication.getName();
    }
}