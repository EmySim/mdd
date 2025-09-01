package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.SubjectDTO;
import com.openclassrooms.mddapi.entity.Subject;
import com.openclassrooms.mddapi.entity.User;
import com.openclassrooms.mddapi.mapper.SubjectMapper;
import com.openclassrooms.mddapi.repository.SubjectRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;

/**
 * Service métier pour la gestion des sujets et abonnements.
 * 
 * Gère les sujets avec statut d'abonnement personnalisé et la logique métier
 * d'abonnement/désabonnement.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final SubjectMapper subjectMapper;

    /**
     * Récupère tous les sujets avec statut d'abonnement pour l'utilisateur connecté.
     * 
     * @param userEmail email de l'utilisateur connecté
     * @param page numéro de page (0-based)
     * @param size taille de page
     * @return Page de SubjectDTO avec indicateur d'abonnement
     */
    public Page<SubjectDTO> getAllSubjects(String userEmail, int page, int size) {
        // Récupération utilisateur connecté
        User user = findUserByEmail(userEmail);

        Pageable pageable = PageRequest.of(page, size);
        Page<Subject> subjectsPage = subjectRepository.findAllByOrderByNameAsc(pageable);

        // Conversion avec statut d'abonnement calculé
        return subjectsPage.map(subject -> {
            SubjectDTO dto = subjectMapper.toDTO(subject);
            dto.setIsSubscribed(user.isSubscribedTo(subject));
            return dto;
        });
    }

    /**
     * Récupère un sujet par son ID avec statut d'abonnement.
     * 
     * @param id ID du sujet
     * @param userEmail email de l'utilisateur connecté
     * @return SubjectDTO avec indicateur d'abonnement
     */
    public SubjectDTO getSubjectById(Long id, String userEmail) {
        Subject subject = findSubjectById(id);
        User user = findUserByEmail(userEmail);

        SubjectDTO dto = subjectMapper.toDTO(subject);
        dto.setIsSubscribed(user.isSubscribedTo(subject));

        return dto;
    }

    /**
     * Abonne un utilisateur à un sujet.
     * 
     * @param subjectId ID du sujet
     * @param userEmail email de l'utilisateur
     * @throws IllegalStateException si l'utilisateur est déjà abonné
     */
    @Transactional
    public void subscribeToSubject(Long subjectId, String userEmail) {
        User user = findUserByEmail(userEmail);
        Subject subject = findSubjectById(subjectId);

        // Vérification état métier
        if (user.isSubscribedTo(subject)) {
            throw new IllegalStateException("Vous êtes déjà abonné à ce sujet");
        }

        // Abonnement via la logique métier de l'entité
        boolean added = user.subscribe(subject);

        if (added) {
            userRepository.save(user);
        } else {
            throw new IllegalStateException("Échec de l'abonnement");
        }
    }

    /**
     * Désabonne un utilisateur d'un sujet.
     * 
     * @param subjectId ID du sujet
     * @param userEmail email de l'utilisateur
     * @throws IllegalStateException si l'utilisateur n'est pas abonné
     */
    @Transactional
    public void unsubscribeFromSubject(Long subjectId, String userEmail) {
        User user = findUserByEmail(userEmail);
        Subject subject = findSubjectById(subjectId);

        // Vérification état métier
        if (!user.isSubscribedTo(subject)) {
            throw new IllegalStateException("Vous n'êtes pas abonné à ce sujet");
        }

        // Désabonnement via la logique métier de l'entité
        boolean removed = user.unsubscribe(subject);

        if (removed) {
            userRepository.save(user);
        } else {
            throw new IllegalStateException("Échec du désabonnement");
        }
    }

    /**
     * Vérifie l'existence d'un nom de sujet.
     * 
     * @param name nom du sujet à vérifier
     * @return true si le nom existe déjà
     */
    public boolean existsByName(String name) {
        return subjectRepository.existsByNameIgnoreCase(name);
    }

    /**
     * Crée un nouveau sujet.
     * 
     * @param subjectDTO données du sujet à créer
     * @return SubjectDTO du sujet créé
     * @throws IllegalStateException si le nom existe déjà
     */
    @Transactional
    public SubjectDTO createSubject(SubjectDTO subjectDTO) {
        if (existsByName(subjectDTO.getName())) {
            throw new IllegalStateException("Un sujet avec ce nom existe déjà");
        }

        Subject subject = subjectMapper.toEntity(subjectDTO);
        Subject savedSubject = subjectRepository.save(subject);

        return subjectMapper.toDTO(savedSubject);
    }

    /**
     * Récupère un utilisateur par email avec gestion d'exception unifiée.
     * 
     * @param email email de l'utilisateur
     * @return entité User
     * @throws EntityNotFoundException si l'utilisateur n'existe pas
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé: " + email));
    }

    /**
     * Récupère un sujet par ID avec gestion d'exception unifiée.
     * 
     * @param id ID du sujet
     * @return entité Subject
     * @throws EntityNotFoundException si le sujet n'existe pas
     */
    private Subject findSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sujet non trouvé avec ID: " + id));
    }
}