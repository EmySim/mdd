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

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service métier User - Gestion complète des utilisateurs avec abonnements.
 * 
 * Fonctionnalités :
 * - Création d'utilisateur (inscription)
 * - Consultation de profil (avec/sans abonnements)
 * - Mise à jour du profil
 * - Gestion des abonnements aux sujets
 * 
 * Architecture : Service → Repository + Mapper
 * Respect SOLID et MVC
 * 
 * @author Équipe MDD
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final SubjectMapper subjectMapper;

    /**
     * ✅ Crée un nouvel utilisateur (inscription).
     * 
     * RÈGLES MÉTIER :
     * - Email et username uniques (contrôlés par la DB)
     * - Mot de passe hashé automatiquement
     * - Dates de création auto-générées
     * - Aucun abonnement initial
     * 
     * @param registerRequest données d'inscription
     * @return UserDTO de l'utilisateur créé
     * @throws DataIntegrityViolationException si email/username déjà utilisé
     */
    public UserDTO createUser(RegisterRequest registerRequest) {
        log.info("🔐 Création utilisateur: {}", registerRequest.getEmail());

        // Conversion DTO → Entity via Mapper
        User user = userMapper.toUser(registerRequest);

        // Hash du mot de passe pour sécurité
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        // Sauvegarde DB-FIRST
        User savedUser = userRepository.save(user);

        log.info("✅ Utilisateur créé: {} (ID: {})", savedUser.getEmail(), savedUser.getId());

        // Conversion Entity → DTO via Mapper
        return userMapper.toDto(savedUser);
    }

    /**
     * ✅ Récupère le profil complet de l'utilisateur avec ses abonnements détaillés.
     * 
     * FONCTIONNALITÉ AVANCÉE :
     * - Profil utilisateur complet
     * - Liste des sujets abonnés avec détails
     * - Statut d'abonnement forcé à true
     * - Optimisé avec Lazy Loading
     * 
     * @param email email de l'utilisateur connecté
     * @return UserDTO avec abonnements complets
     * @throws EntityNotFoundException si utilisateur inexistant
     */
     @Transactional(readOnly = true)
    public UserDTO getUserProfileWithSubscriptions(String email) {
        log.debug("📖 Consultation profil avec abonnements: {}", email);

        User user = findUserByEmail(email);
        
        // ✅ Utilisation de la gestion manuelle (plus simple)
        UserDTO userDTO = userMapper.toDto(user);

        // Gestion manuelle des abonnements avec statut
        if (user.getSubscribedSubjects() != null && !user.getSubscribedSubjects().isEmpty()) {
            List<SubjectDTO> subscribedSubjects = user.getSubscribedSubjects()
                    .stream()
                    .map(subject -> {
                        SubjectDTO dto = subjectMapper.toDTO(subject);
                        dto.setIsSubscribed(true);
                        return dto;
                    })
                    .collect(Collectors.toList());
            
            userDTO.setSubscribedSubjects(subscribedSubjects);
            log.debug("📌 {} abonnements trouvés", subscribedSubjects.size());
        } else {
            userDTO.setSubscribedSubjects(new ArrayList<>());
            log.debug("📌 Aucun abonnement trouvé");
        }

        return userDTO;
    }

    /**
     * ✅ Met à jour le profil utilisateur.
     * 
     * RÈGLES MÉTIER :
     * - Mise à jour partielle (champs non null uniquement)
     * - Email normalisé (lowercase, trim)
     * - Username nettoyé (trim)
     * - Mot de passe re-hashé si fourni
     * - Date de mise à jour auto-générée
     * 
     * @param currentEmail email actuel de l'utilisateur
     * @param userUpdate   données de mise à jour
     * @return UserDTO mis à jour
     * @throws EntityNotFoundException si utilisateur inexistant
     */
    public UserDTO updateUserProfile(String currentEmail, UserDTO userUpdate) {
        log.info("🔄 Mise à jour profil: {}", currentEmail);

        User user = findUserByEmail(currentEmail);

        // ✅ MISE À JOUR CONDITIONNELLE

        // Username : nettoyage et validation
        if (userUpdate.getUsername() != null && !userUpdate.getUsername().trim().isEmpty()) {
            String cleanUsername = userUpdate.getUsername().trim();
            user.setUsername(cleanUsername);
            log.debug("📝 Username mis à jour: {}", cleanUsername);
        }

        // Email : normalisation et validation
        if (userUpdate.getEmail() != null && !userUpdate.getEmail().trim().isEmpty()) {
            String cleanEmail = userUpdate.getEmail().trim().toLowerCase();
            user.setEmail(cleanEmail);
            log.debug("📧 Email mis à jour: {}", cleanEmail);
        }

        // Mot de passe : hash si fourni
        if (userUpdate.getPassword() != null && !userUpdate.getPassword().trim().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(userUpdate.getPassword());
            user.setPassword(hashedPassword);
            log.debug("🔐 Mot de passe mis à jour");
        }

        // Sauvegarde avec mise à jour auto de updatedAt
        User updatedUser = userRepository.save(user);

        log.info("✅ Profil mis à jour: {}", updatedUser.getEmail());

        return userMapper.toDto(updatedUser);
    }

    /**
     * ✅ Compte le nombre total d'utilisateurs.
     * 
     * Utilisé pour :
     * - Statistiques admin
     * - Monitoring
     * 
     * @return nombre total d'utilisateurs
     */
    @Transactional(readOnly = true)
    public long countAllUsers() {
        long count = userRepository.count();
        log.debug("📊 Nombre total d'utilisateurs: {}", count);
        return count;
    }

    /**
     * ✅ Récupère un utilisateur par email (méthode interne).
     * 
     * SÉCURITÉ :
     * - Méthode privée pour éviter exposition
     * - Exception explicite si non trouvé
     * - Log pour traçabilité
     * 
     * @param email email de recherche
     * @return User trouvé
     * @throws EntityNotFoundException si utilisateur inexistant
     */
    private User findUserByEmail(String email) {
        log.debug("🔍 Recherche utilisateur: {}", email);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("❌ Utilisateur non trouvé: {}", email);
                    return new EntityNotFoundException("Utilisateur non trouvé: " + email);
                });
    }
}