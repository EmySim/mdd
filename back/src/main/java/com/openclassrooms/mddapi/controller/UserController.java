package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.UserDTO;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
import com.openclassrooms.mddapi.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
@Slf4j
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;

    /**
     * ✅ Récupère le profil de l'utilisateur connecté
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getCurrentUserProfile(@PathVariable("id") Long id) {
        String email = getCurrentUserEmail();
        log.info("🔍 Consultation profil utilisateur: {}", email);

        UserDTO userProfile = userService.getUserProfileWithSubscriptions(email);

        return ResponseEntity.ok(userProfile);
    }

    /**
     * ✅ Met à jour le profil de l'utilisateur connecté
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateCurrentUserProfile(@PathVariable("id") Long id, @Valid @RequestBody UserDTO updateRequest) {
        String email = getCurrentUserEmail();
        log.info("🔄 Modification profil utilisateur: {}", email);

        UserDTO updatedUser = userService.updateUserProfile(email, updateRequest);

        log.info("✅ Profil modifié: {} → {}", email, updatedUser.getEmail());

        return ResponseEntity.ok(updatedUser);
    }

    /**
     * ✅ Déconnexion de l'utilisateur
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
        String email = getCurrentUserEmail();
        log.info("🚪 Déconnexion utilisateur: {}", email);

        return ResponseEntity.ok(MessageResponse.success("Déconnexion réussie"));
    }

    /**
     * Récupère l'email de l'utilisateur connecté depuis le SecurityContext.
     */
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Aucun utilisateur authentifié");
        }

        return authentication.getName();
    }
}