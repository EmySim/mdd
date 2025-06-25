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
 * Service métier Subject - MVP STRICT.
 *
 * **FONCTIONNALITÉS MVP UNIQUEMENT :**
 * - Affichage des sujets pour utilisateurs connectés
 * - Abonnement/désabonnement d'un utilisateur à un sujet
 * - Pagination simple
 *
 * @author Équipe MDD
 * @version 1.0
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
     * @param userEmail email de l'utilisateur connecté
     * @param page numéro de page
     * @param size taille de page
     * @return Page de SubjectDTO avec statut d'abonnement
     */
    public Page<SubjectDTO> getAllSubjects(String userEmail, int page, int size) {
        log.debug("📄 Liste sujets pour: {} - Page: {}, Size: {}", userEmail, page, size);

        // Récupération utilisateur connecté
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + userEmail));

        Pageable pageable = PageRequest.of(page, size);
        Page<Subject> subjectsPage = subjectRepository.findAllByOrderByNameAsc(pageable);

        // Conversion avec statut d'abonnement
        return subjectsPage.map(subject -> {
            SubjectDTO dto = subjectMapper.toDTO(subject);
            dto.setIsSubscribed(subjectRepository.isUserSubscribedToSubject(subject.getId(), user.getId()));
            return dto;
        });
    }

    /**
     * Récupère un sujet par son ID avec statut d'abonnement.
     *
     * @param id ID du sujet
     * @param userEmail email de l'utilisateur connecté
     * @return SubjectDTO avec statut d'abonnement
     */
    public SubjectDTO getSubjectById(Long id, String userEmail) {
        log.debug("🔍 Recherche sujet ID: {} pour: {}", id, userEmail);

        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sujet non trouvé avec ID: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + userEmail));

        SubjectDTO dto = subjectMapper.toDTO(subject);
        dto.setIsSubscribed(subjectRepository.isUserSubscribedToSubject(id, user.getId()));

        return dto;
    }

    /**
     * Abonne un utilisateur à un sujet.
     *
     * @param subjectId ID du sujet
     * @param userEmail email de l'utilisateur connecté
     * @throws IllegalStateException si déjà abonné
     */
    @Transactional
    public void subscribeToSubject(Long subjectId, String userEmail) {
        log.info("📌 Abonnement sujet ID: {} par: {}", subjectId, userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + userEmail));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new EntityNotFoundException("Sujet non trouvé avec ID: " + subjectId));

        // Vérification si déjà abonné
        if (subjectRepository.isUserSubscribedToSubject(subjectId, user.getId())) {
            throw new IllegalStateException("Vous êtes déjà abonné à ce sujet");
        }

        // Ajout de l'abonnement
        user.getSubscribedSubjects().add(subject);
        userRepository.save(user);

        log.info("✅ Abonné à '{}' par {}", subject.getName(), userEmail);
    }

    /**
     * Désabonne un utilisateur d'un sujet.
     *
     * @param subjectId ID du sujet
     * @param userEmail email de l'utilisateur connecté
     * @throws IllegalStateException si pas abonné
     */
    @Transactional
    public void unsubscribeFromSubject(Long subjectId, String userEmail) {
        log.info("📌 Désabonnement sujet ID: {} par: {}", subjectId, userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + userEmail));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new EntityNotFoundException("Sujet non trouvé avec ID: " + subjectId));

        // Vérification si abonné
        if (!subjectRepository.isUserSubscribedToSubject(subjectId, user.getId())) {
            throw new IllegalStateException("Vous n'êtes pas abonné à ce sujet");
        }

        // Suppression de l'abonnement
        user.getSubscribedSubjects().remove(subject);
        userRepository.save(user);

        log.info("✅ Désabonné de '{}' par {}", subject.getName(), userEmail);
    }
}