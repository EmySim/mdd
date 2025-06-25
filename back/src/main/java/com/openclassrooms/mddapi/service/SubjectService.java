package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.SubjectDTO;
import com.openclassrooms.mddapi.entity.Subject;
import com.openclassrooms.mddapi.mapper.SubjectMapper;
import com.openclassrooms.mddapi.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.List;

/**
 * Service métier Subject - CRUD avec Mapper.
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
    private final SubjectMapper subjectMapper;

    /**
     * Crée un nouveau sujet.
     */
    @Transactional
    public SubjectDTO createSubject(SubjectDTO subjectDTO) {
        log.info("📝 Création sujet: {}", subjectDTO.getName());

        // Validation unicité nom
        if (subjectRepository.existsByName(subjectDTO.getName())) {
            throw new IllegalArgumentException("Subject name already exists: " + subjectDTO.getName());
        }

        // Conversion DTO → Entity
        Subject subject = subjectMapper.toEntity(subjectDTO);

        // Sauvegarde (DB gère l'auto-increment et created_at)
        Subject savedSubject = subjectRepository.save(subject);

        log.info("✅ Sujet créé: {} (ID: {})", savedSubject.getName(), savedSubject.getId());

        // Conversion Entity → DTO
        return subjectMapper.toDTO(savedSubject);
    }

    /**
     * Met à jour un sujet existant.
     */
    @Transactional
    public SubjectDTO updateSubject(Long id, SubjectDTO subjectDTO) {
        log.info("🔄 Mise à jour sujet ID: {}", id);

        // Récupération sujet existant
        Subject existingSubject = subjectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found with id: " + id));

        // Validation unicité nom si changement
        if (subjectDTO.getName() != null && !subjectDTO.getName().equals(existingSubject.getName())) {
            if (subjectRepository.existsByName(subjectDTO.getName())) {
                throw new IllegalArgumentException("Subject name already exists: " + subjectDTO.getName());
            }
        }

        // Mise à jour avec Mapper (ignore les valeurs null)
        subjectMapper.updateEntityFromDTO(subjectDTO, existingSubject);

        // Sauvegarde
        Subject updatedSubject = subjectRepository.save(existingSubject);

        log.info("✅ Sujet mis à jour: {}", updatedSubject.getName());

        return subjectMapper.toDTO(updatedSubject);
    }

    /**
     * Supprime un sujet.
     */
    @Transactional
    public void deleteSubject(Long id) {
        log.info("🗑️ Suppression sujet ID: {}", id);

        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found with id: " + id));

        subjectRepository.delete(subject);

        log.info("✅ Sujet supprimé: {}", subject.getName());
    }

    /**
     * Récupère un sujet par ID.
     */
    public SubjectDTO getSubjectById(Long id) {
        log.debug("🔍 Recherche sujet ID: {}", id);

        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found with id: " + id));

        return subjectMapper.toDTO(subject);
    }

    /**
     * Récupère un sujet par nom.
     */
    public SubjectDTO getSubjectByName(String name) {
        log.debug("🔍 Recherche sujet par nom: {}", name);

        Subject subject = subjectRepository.findByName(name)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found with name: " + name));

        return subjectMapper.toDTO(subject);
    }

    /**
     * Liste paginée de tous les sujets.
     */
    public Page<SubjectDTO> getAllSubjects(int page, int size) {
        log.debug("📄 Liste sujets - Page: {}, Size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<Subject> subjectsPage = subjectRepository.findAll(pageable);

        log.debug("📊 {} sujets trouvés", subjectsPage.getTotalElements());

        // Conversion Page<Entity> → Page<DTO>
        return subjectsPage.map(subjectMapper::toDTO);
    }

    /**
     * Tous les sujets (pour listes déroulantes).
     */
    public List<SubjectDTO> getAllSubjects() {
        log.debug("📋 Récupération tous sujets");

        List<Subject> subjects = subjectRepository.findAll();

        return subjectMapper.toDTOList(subjects);
    }

    /**
     * Vérifie si un nom de sujet existe.
     */
    public boolean existsByName(String name) {
        return subjectRepository.existsByName(name);
    }

    /**
     * Compte le nombre total de sujets.
     */
    public long countAllSubjects() {
        return subjectRepository.count();
    }
}