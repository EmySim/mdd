package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.SubjectDTO;
import com.openclassrooms.mddapi.entity.Subject;
import com.openclassrooms.mddapi.entity.User;
import com.openclassrooms.mddapi.mapper.SubjectMapper;
import com.openclassrooms.mddapi.repository.SubjectRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;

/**
 * Service métier Subject - Clean Architecture.
 *
 * ✅ BONNES PRATIQUES APPLIQUÉES :
 * - Gestion des entités en interne uniquement
 * - DTOs pour toutes les interfaces publiques
 * - Transactions optimisées et explicites
 * - Logique métier encapsulée
 * - Pas de fuite d'entités vers les contrôleurs
 *
 * @author Équipe MDD
 * @version 2.0 - Clean Architecture
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final SubjectMapper subjectMapper;

    /**
     * Récupère tous les sujets avec statut d'abonnement pour l'utilisateur connecté.
     *
     * ✅ BONNE PRATIQUE :
     * - Transaction read-only pour performance
     * - Conversion Entity → DTO au niveau service
     * - Statut d'abonnement calculé côté service
     */
    public Page<SubjectDTO> getAllSubjects(String userEmail, int page, int size) {
        log.debug("📄 Liste sujets pour: {} - Page: {}, Size: {}", userEmail, page, size);

        // Récupération utilisateur connecté
        User user = findUserByEmail(userEmail);

        Pageable pageable = PageRequest.of(page, size);
        Page<Subject> subjectsPage = subjectRepository.findAllByOrderByNameAsc(pageable);

        // ✅ Conversion avec statut d'abonnement calculé
        return subjectsPage.map(subject -> {
            SubjectDTO dto = subjectMapper.toDTO(subject);
            dto.setIsSubscribed(user.isSubscribedTo(subject));
            return dto;
        });
    }

    /**
     * Récupère un sujet par son ID avec statut d'abonnement.
     */
    public SubjectDTO getSubjectById(Long id, String userEmail) {
        log.debug("🔍 Recherche sujet ID: {} pour: {}", id, userEmail);

        Subject subject = findSubjectById(id);
        User user = findUserByEmail(userEmail);

        SubjectDTO dto = subjectMapper.toDTO(subject);
        dto.setIsSubscribed(user.isSubscribedTo(subject));

        return dto;
    }

    /**
     * Abonne un utilisateur à un sujet.
     *
     * ✅ BONNES PRATIQUES :
     * - Transaction complète pour cohérence
     * - Logique métier dans les entités
     * - Vérifications business avant action
     * - Gestion des états métier propres
     */
    @Transactional
    public void subscribeToSubject(Long subjectId, String userEmail) {
        log.info("📌 Abonnement sujet ID: {} par: {}", subjectId, userEmail);

        User user = findUserByEmail(userEmail);
        Subject subject = findSubjectById(subjectId);

        // ✅ Logique métier dans l'entité
        if (user.isSubscribedTo(subject)) {
            throw new IllegalStateException("Vous êtes déjà abonné à ce sujet");
        }

        // ✅ Utilisation des méthodes métier des entités
        boolean added = user.subscribe(subject);

        if (added) {
            // Sauvegarde optimisée - seul l'utilisateur change
            userRepository.save(user);
            log.info("✅ Abonné à '{}' par {}", subject.getName(), userEmail);
        } else {
            // Cas edge improbable mais géré
            log.warn("⚠️ Échec abonnement inexpliqué pour {} à {}", userEmail, subject.getName());
            throw new IllegalStateException("Échec de l'abonnement");
        }
    }

    /**
     * Désabonne un utilisateur d'un sujet.
     *
     * ✅ Même logique propre que subscribe
     */
    @Transactional
    public void unsubscribeFromSubject(Long subjectId, String userEmail) {
        log.info("📌 Désabonnement sujet ID: {} par: {}", subjectId, userEmail);

        User user = findUserByEmail(userEmail);
        Subject subject = findSubjectById(subjectId);

        // ✅ Logique métier dans l'entité
        if (!user.isSubscribedTo(subject)) {
            throw new IllegalStateException("Vous n'êtes pas abonné à ce sujet");
        }

        // ✅ Utilisation des méthodes métier des entités
        boolean removed = user.unsubscribe(subject);

        if (removed) {
            // Sauvegarde optimisée
            userRepository.save(user);
            log.info("✅ Désabonné de '{}' par {}", subject.getName(), userEmail);
        } else {
            // Cas edge improbable mais géré
            log.warn("⚠️ Échec désabonnement inexpliqué pour {} de {}", userEmail, subject.getName());
            throw new IllegalStateException("Échec du désabonnement");
        }
    }

    // ============================================================================
    // MÉTHODES PRIVÉES - GESTION ENTITÉS INTERNE
    // ============================================================================

    /**
     * ✅ Récupération utilisateur encapsulée.
     *
     * AVANTAGES :
     * - Exception uniforme
     * - Log centralisé
     * - Réutilisable
     * - Évite duplication code
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + email));
    }

    /**
     * ✅ Récupération sujet encapsulée.
     */
    private Subject findSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sujet non trouvé avec ID: " + id));
    }

    // ============================================================================
    // MÉTHODES PUBLIQUES ADDITIONNELLES
    // ============================================================================

    /**
     * Vérifie l'existence d'un nom de sujet.
     */
    public boolean existsByName(String name) {
        log.debug("🔍 Vérification existence nom sujet: {}", name);
        return subjectRepository.existsByNameIgnoreCase(name);
    }

    /**
     * Crée un nouveau sujet.
     */
    @Transactional
    public SubjectDTO createSubject(SubjectDTO subjectDTO) {
        log.info("📝 Création sujet: {}", subjectDTO.getName());

        if (existsByName(subjectDTO.getName())) {
            throw new IllegalStateException("Un sujet avec ce nom existe déjà");
        }

        Subject subject = subjectMapper.toEntity(subjectDTO);
        Subject savedSubject = subjectRepository.save(subject);

        log.info("✅ Sujet créé: '{}' (ID: {})", savedSubject.getName(), savedSubject.getId());
        return subjectMapper.toDTO(savedSubject);
    }
}