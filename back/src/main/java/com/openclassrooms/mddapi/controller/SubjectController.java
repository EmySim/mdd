package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.SubjectDTO;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
import com.openclassrooms.mddapi.service.SubjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.util.List;

/**
 * Contrôleur REST Subject - CRUD basique.
 *
 * @author Équipe MDD
 * @version 1.0
 */
@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@Slf4j
public class SubjectController {

    private final SubjectService subjectService;

    // ============================================================================
    // PUBLIC ENDPOINTS
    // ============================================================================

    /**
     * Liste paginée des sujets.
     */
    @GetMapping
    public ResponseEntity<Page<SubjectDTO>> getAllSubjects(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        log.debug("📄 GET /api/subjects - Page: {}, Size: {}", page, size);

        Page<SubjectDTO> subjects = subjectService.getAllSubjects(page, size);

        log.info("✅ {} sujets retournés", subjects.getNumberOfElements());
        return ResponseEntity.ok(subjects);
    }

    /**
     * Détail d'un sujet par ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Long id) {
        log.debug("🔍 GET /api/subjects/{}", id);

        SubjectDTO subject = subjectService.getSubjectById(id);

        log.info("✅ Sujet retourné: {}", subject.getName());
        return ResponseEntity.ok(subject);
    }

    /**
     * Tous les sujets (pour listes déroulantes).
     */
    @GetMapping("/all")
    public ResponseEntity<List<SubjectDTO>> getAllSubjects() {
        log.debug("📋 GET /api/subjects/all");

        List<SubjectDTO> subjects = subjectService.getAllSubjects();

        log.info("📊 {} sujets retournés", subjects.size());
        return ResponseEntity.ok(subjects);
    }

    // ============================================================================
    // AUTHENTICATED ENDPOINTS
    // ============================================================================

    /**
     * Création d'un sujet.
     */
    @PostMapping
    public ResponseEntity<SubjectDTO> createSubject(@Valid @RequestBody SubjectDTO subjectDTO) {
        log.info("📝 POST /api/subjects - Création: {}", subjectDTO.getName());

        SubjectDTO createdSubject = subjectService.createSubject(subjectDTO);

        log.info("✅ Sujet créé: {} (ID: {})", createdSubject.getName(), createdSubject.getId());
        return new ResponseEntity<>(createdSubject, HttpStatus.CREATED);
    }

    /**
     * Mise à jour d'un sujet.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubjectDTO> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody SubjectDTO subjectDTO) {

        log.info("🔄 PUT /api/subjects/{}", id);

        SubjectDTO updatedSubject = subjectService.updateSubject(id, subjectDTO);

        log.info("✅ Sujet mis à jour: {}", updatedSubject.getName());
        return ResponseEntity.ok(updatedSubject);
    }

    /**
     * Suppression d'un sujet.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteSubject(@PathVariable Long id) {
        log.info("🗑️ DELETE /api/subjects/{}", id);

        subjectService.deleteSubject(id);

        log.info("✅ Sujet supprimé: ID {}", id);
        return ResponseEntity.ok(MessageResponse.success("Subject deleted successfully"));
    }

    // ============================================================================
    // UTILITY ENDPOINTS
    // ============================================================================

    /**
     * Vérification disponibilité nom.
     */
    @GetMapping("/check-name")
    public ResponseEntity<Boolean> checkNameAvailability(@RequestParam String name) {
        log.debug("✔️ GET /api/subjects/check-name?name={}", name);

        boolean available = !subjectService.existsByName(name);

        log.debug("📋 Nom '{}' disponible: {}", name, available);
        return ResponseEntity.ok(available);
    }

    /**
     * Health check du service.
     */
    @GetMapping("/health")
    public ResponseEntity<MessageResponse> getHealthStatus() {
        try {
            long subjectCount = subjectService.countAllSubjects();

            String message = String.format("Subject service operational - %d subjects available", subjectCount);
            return ResponseEntity.ok(MessageResponse.info(message));

        } catch (Exception e) {
            log.error("❌ Erreur health check: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(MessageResponse.error("Subject service unavailable"));
        }
    }
}