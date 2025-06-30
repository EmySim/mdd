package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.SubjectDTO;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
import com.openclassrooms.mddapi.service.SubjectService;
import com.openclassrooms.mddapi.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

/**
 * Contrôleur REST Subject - MVP STRICT.
 *
 * **ENDPOINTS MVP UNIQUEMENT :**
 * - GET /api/subjects : Liste des sujets avec statut d'abonnement
 * - GET /api/subjects/{id} : Détail d'un sujet avec statut d'abonnement
 * - POST /api/subjects/{id}/subscribe : S'abonner à un sujet
 * - DELETE /api/subjects/{id}/subscribe : Se désabonner d'un sujet
 *
 * **RÈGLES MÉTIER MVP :**
 * - Visible uniquement pour utilisateurs connectés
 * - Affichage avec statut d'abonnement (bouton S'abonner/Se désabonner)
 * - Pagination simple
 *
 * @author Équipe MDD
 * @version 1.0
 */
@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Slf4j
public class SubjectController {

    private final SubjectService subjectService;

    /**
     * Liste paginée de tous les sujets avec statut d'abonnement.
     *
     * @param page numéro de page (0-based, défaut: 0)
     * @param size taille de page (défaut: 20, max: 100)
     * @return Page de SubjectDTO avec statut d'abonnement
     */
    @GetMapping
    public ResponseEntity<Page<SubjectDTO>> getAllSubjects(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.debug("📄 GET /api/subjects - Utilisateur: {}, Page: {}, Size: {}", userEmail, page, size);

        Page<SubjectDTO> subjects = subjectService.getAllSubjects(userEmail, page, size);

        log.info("✅ {} sujets retournés pour {}", subjects.getNumberOfElements(), userEmail);
        return ResponseEntity.ok(subjects);
    }

    /**
     * Détail d'un sujet par son ID avec statut d'abonnement.
     *
     * @param id ID du sujet
     * @return SubjectDTO avec statut d'abonnement
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Long id) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.debug("🔍 GET /api/subjects/{} - Utilisateur: {}", id, userEmail);

        SubjectDTO subject = subjectService.getSubjectById(id, userEmail);

        log.info("✅ Sujet retourné: '{}' (ID: {}) pour {}", subject.getName(), id, userEmail);
        return ResponseEntity.ok(subject);
    }

    /**
     * S'abonner à un sujet.
     *
     * @param id ID du sujet
     * @return Message de confirmation
     */
    @PostMapping("/{id}/subscribe")
    public ResponseEntity<MessageResponse> subscribeToSubject(@PathVariable Long id) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.info("📌 POST /api/subjects/{}/subscribe - Utilisateur: {}", id, userEmail);

        subjectService.subscribeToSubject(id, userEmail);

        log.info("✅ Abonnement réussi: sujet ID {} par {}", id, userEmail);
        return ResponseEntity.ok(MessageResponse.success("Abonnement réussi"));
    }

    /**
     * Se désabonner d'un sujet.
     *
     * @param id ID du sujet
     * @return Message de confirmation
     */
    @DeleteMapping("/{id}/subscribe")
    public ResponseEntity<MessageResponse> unsubscribeFromSubject(@PathVariable Long id) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.info("📌 DELETE /api/subjects/{}/subscribe - Utilisateur: {}", id, userEmail);

        subjectService.unsubscribeFromSubject(id, userEmail);

        log.info("✅ Désabonnement réussi: sujet ID {} par {}", id, userEmail);
        return ResponseEntity.ok(MessageResponse.success("Désabonnement réussi"));
    }

    /**
     * Health check endpoint for subjects.
     *
     * @return Status message
     */
    @GetMapping("/health")
    public ResponseEntity<MessageResponse> getHealth() {
        log.debug("🔍 GET /api/subjects/health - Health check");
        return ResponseEntity.ok(MessageResponse.success("Subjects service is operational"));
    }

    /**
     * Get all subjects (alternative endpoint).
     *
     * @param page numéro de page (0-based, défaut: 0)
     * @param size taille de page (défaut: 20, max: 100)
     * @return Page de SubjectDTO avec statut d'abonnement
     */
    @GetMapping("/all")
    public ResponseEntity<Page<SubjectDTO>> getAllSubjectsAlternative(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.debug("📄 GET /api/subjects/all - Utilisateur: {}, Page: {}, Size: {}", userEmail, page, size);

        Page<SubjectDTO> subjects = subjectService.getAllSubjects(userEmail, page, size);

        log.info("✅ {} sujets retournés pour {}", subjects.getNumberOfElements(), userEmail);
        return ResponseEntity.ok(subjects);
    }

    /**
     * Check if a subject name is available.
     *
     * @param name subject name to check
     * @return availability status
     */
    @GetMapping("/check-name")
    public ResponseEntity<MessageResponse> checkSubjectName(@RequestParam String name) {
        log.debug("🔍 GET /api/subjects/check-name - Name: {}", name);
        
        boolean exists = subjectService.existsByName(name);
        
        if (exists) {
            return ResponseEntity.ok(MessageResponse.info("Subject name already exists"));
        } else {
            return ResponseEntity.ok(MessageResponse.success("Subject name is available"));
        }
    }

    /**
     * Create a new subject (alternative POST endpoint).
     *
     * @param subjectDTO subject data
     * @return created subject
     */
    @PostMapping
    public ResponseEntity<SubjectDTO> createSubject(@RequestBody SubjectDTO subjectDTO) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.info("📝 POST /api/subjects - Création par: {}", userEmail);
        
        SubjectDTO createdSubject = subjectService.createSubject(subjectDTO);
        
        log.info("✅ Sujet créé: '{}' (ID: {})", createdSubject.getName(), createdSubject.getId());
        return ResponseEntity.ok(createdSubject);
    }

    /**
     * Update a subject.
     *
     * @param id subject ID
     * @param subjectDTO updated subject data
     * @return updated subject
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubjectDTO> updateSubject(@PathVariable Long id, @RequestBody SubjectDTO subjectDTO) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.info("🔄 PUT /api/subjects/{} - Mise à jour par: {}", id, userEmail);
        
        SubjectDTO updatedSubject = subjectService.updateSubject(id, subjectDTO);
        
        log.info("✅ Sujet mis à jour: '{}' (ID: {})", updatedSubject.getName(), id);
        return ResponseEntity.ok(updatedSubject);
    }

    /**
     * Delete a subject.
     *
     * @param id subject ID
     * @return deletion confirmation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteSubject(@PathVariable Long id) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.info("🗑️ DELETE /api/subjects/{} - Suppression par: {}", id, userEmail);
        
        subjectService.deleteSubject(id);
        
        log.info("✅ Sujet supprimé: ID {}", id);
        return ResponseEntity.ok(MessageResponse.success("Subject deleted successfully"));
    }
}