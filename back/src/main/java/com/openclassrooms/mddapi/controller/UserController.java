package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.UserDTO;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
import com.openclassrooms.mddapi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * Contrôleur REST pour la gestion du profil utilisateur.
 * 
 * Endpoints : GET /api/user/{id}, PUT /api/user/{id}, POST /api/user/logout
 * 
 * @author Équipe MDD
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;

    /**
     * Récupère le profil de l'utilisateur connecté avec ses abonnements.
     * 
     * @param id ID de l'utilisateur
     * @return UserDTO avec profil et abonnements
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getCurrentUserProfile(@PathVariable("id") Long id) {
        String email = getCurrentUserEmail();
        UserDTO userProfile = userService.getUserProfileWithSubscriptions(email);
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
        String email = getCurrentUserEmail();
        UserDTO updatedUser = userService.updateUserProfile(email, updateRequest);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Déconnexion de l'utilisateur.
     * 
     * @return MessageResponse de confirmation
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
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