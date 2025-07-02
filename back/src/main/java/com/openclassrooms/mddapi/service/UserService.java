package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.UserDTO;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.entity.User;
import com.openclassrooms.mddapi.mapper.UserMapper;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;

@Service
@Slf4j
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    /**
     * Crée un nouvel utilisateur (inscription)
     */
    public UserDTO createUser(RegisterRequest registerRequest) {
        log.info("🔐 Création utilisateur: {}", registerRequest.getEmail());

        // Conversion et hash du mot de passe
        User user = userMapper.toUser(registerRequest);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        // DB-FIRST : Save direct
        User savedUser = userRepository.save(user);

        log.info("✅ Utilisateur créé: {} (ID: {})", savedUser.getEmail(), savedUser.getId());

        return userMapper.toDto(savedUser);
    }

    /**
     * ✅ Récupère le profil complet de l'utilisateur avec ses abonnements.
     */
    @Transactional(readOnly = true)
    public UserDTO getUserProfileWithSubscriptions(String email) {
        log.debug("📖 Consultation profil avec abonnements: {}", email);

        User user = findUserByEmail(email);
        UserDTO userDTO = userMapper.toDto(user);

        // TODO: Ajouter les abonnements quand les Sujets seront implémentés

        return userDTO;
    }

    /**
     * ✅ Met à jour le profil de l'utilisateur.
     */
    public UserDTO updateUserProfile(String currentEmail, UserDTO userUpdate) {
        log.info("🔄 Mise à jour profil: {}", currentEmail);

        User user = findUserByEmail(currentEmail);

        // Mise à jour des champs fournis
        if (userUpdate.getUsername() != null && !userUpdate.getUsername().trim().isEmpty()) {
            user.setUsername(userUpdate.getUsername().trim());
        }

        if (userUpdate.getEmail() != null && !userUpdate.getEmail().trim().isEmpty()) {
            user.setEmail(userUpdate.getEmail().trim().toLowerCase());
        }

        if (userUpdate.getPassword() != null && !userUpdate.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userUpdate.getPassword()));
        }

        // DB-FIRST : Save direct
        User updatedUser = userRepository.save(user);

        log.info("✅ Profil mis à jour: {}", updatedUser.getEmail());

        return userMapper.toDto(updatedUser);
    }

    /**
     * Compte le nombre total d'utilisateurs
     */
    @Transactional(readOnly = true)
    public long countAllUsers() {
        return userRepository.count();
    }

    /**
     * Récupère un utilisateur par email
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + email));
    }
}