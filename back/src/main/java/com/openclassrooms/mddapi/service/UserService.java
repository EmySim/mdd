package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.SubjectDTO;
import com.openclassrooms.mddapi.dto.UserDTO;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.entity.User;
import com.openclassrooms.mddapi.mapper.SubjectMapper;
import com.openclassrooms.mddapi.mapper.UserMapper;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.Collections;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service métier pour la gestion des utilisateurs et de leurs abonnements.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final SubjectMapper subjectMapper;

    /**
     * Crée un nouvel utilisateur.
     *
     * @param registerRequest données d'inscription.
     * @return DTO de l'utilisateur créé.
     */
    @Transactional
    public UserDTO createUser(RegisterRequest registerRequest) {
        log.info("Creating user with email: {}", registerRequest.getEmail());
        User user = userMapper.toUser(registerRequest);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        User savedUser = userRepository.save(user);
        log.info("User created successfully: {} (ID: {})", savedUser.getEmail(), savedUser.getId());
        return userMapper.toDto(savedUser);
    }


    /**
     * Récupère le profil de l'utilisateur avec ses abonnements.
     *
     * @param email email de l'utilisateur.
     * @return DTO de l'utilisateur avec la liste de ses abonnements.
     */
    @Transactional(readOnly = true)
    public UserDTO getUserProfileWithSubscriptions(String email) {
        log.debug("Fetching user profile with subscriptions for: {}", email);
        User user = findUserByEmail(email);
        UserDTO userDTO = userMapper.toDto(user);

        userDTO.setSubscribedSubjects(
            Optional.ofNullable(user.getSubscribedSubjects())
                .orElse(Collections.emptySet())
                .stream()
                .map(subject -> {
                    SubjectDTO dto = subjectMapper.toDTO(subject);
                    dto.setIsSubscribed(true);
                            return dto;
                        })
                        .collect(Collectors.toList())
        );

        log.debug("{} subscriptions found.", userDTO.getSubscribedSubjects().size());
        return userDTO;
    }



    /**
     * Met à jour le profil utilisateur.
     *
     * @param currentEmail email actuel de l'utilisateur.
     * @param userUpdate   données de mise à jour.
     * @return DTO de l'utilisateur mis à jour.
     */
    @Transactional
    public UserDTO updateUserProfile(String currentEmail, UserDTO userUpdate) {
        log.info("Updating profile for user: {}", currentEmail);
        User user = findUserByEmail(currentEmail);

        Optional.ofNullable(userUpdate.getUsername())
                .filter(username -> !username.trim().isEmpty())
                .ifPresent(cleanUsername -> {
                    user.setUsername(cleanUsername.trim());
                    log.debug("Username updated to: {}", user.getUsername());
                });

        Optional.ofNullable(userUpdate.getEmail())
                .filter(email -> !email.trim().isEmpty())
                .ifPresent(cleanEmail -> {
                    user.setEmail(cleanEmail.trim().toLowerCase());
                    log.debug("Email updated to: {}", user.getEmail());
                });

        Optional.ofNullable(userUpdate.getPassword())
                .filter(password -> !password.trim().isEmpty())
                .ifPresent(password -> {
                    user.setPassword(passwordEncoder.encode(password));
                    log.debug("Password updated.");
                });

        User updatedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", updatedUser.getEmail());
        return userMapper.toDto(updatedUser);
    }



    /**
     * Compte le nombre total d'utilisateurs.
     *
     * @return le nombre total d'utilisateurs.
     */
    @Transactional(readOnly = true)
    public long countAllUsers() {
        long count = userRepository.count();
        log.debug("Total number of users: {}", count);
        return count;
    }



    /**
     * Récupère une entité User par email (méthode interne).
     *
     * @param email email de l'utilisateur.
     * @return l'entité User.
     * @throws EntityNotFoundException si l'utilisateur n'est pas trouvé.
     */
    private User findUserByEmail(String email) {
        log.debug("Looking for user by email: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", email);
                    return new EntityNotFoundException("User not found: " + email);
                });
    }
}