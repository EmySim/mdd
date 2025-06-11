package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.entity.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;



/**
 * Service d'authentification pour Spring Security.
 *
 * Charge les utilisateurs depuis la base de données MySQL
 * pour l'authentification JWT et login classique.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Charge un utilisateur par son email pour l'authentification.
     * Méthode obligatoire de UserDetailsService.
     *
     * @param email email de l'utilisateur
     * @return UserDetails pour Spring Security
     * @throws UsernameNotFoundException si utilisateur non trouvé
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Chargement utilisateur : {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + email));

        log.debug("Utilisateur trouvé : {}", user.getUsername());

        // Création UserDetails avec rôle USER par défaut
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())      // Spring Security utilise l'email comme username
                .password(user.getPassword())   // Mot de passe déjà hashé en base
                .authorities("ROLE_USER")       // Rôle par défaut pour le MVP
                .accountExpired(false)          // MVP : compte jamais expiré
                .accountLocked(false)           // MVP : compte jamais verrouillé
                .credentialsExpired(false)      // MVP : credentials jamais expirés
                .disabled(false)                // MVP : compte toujours actif
                .build();
    }
}