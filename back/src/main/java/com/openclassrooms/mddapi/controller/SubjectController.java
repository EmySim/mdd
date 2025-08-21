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
 * Contrôleur REST Subject - Clean Architecture.
 *
 * ✅ BONNE PRATIQUE : Contrôleur qui ne manipule QUE des DTOs
 * - Jamais d'entités dans les signatures
 * - Conversion Entity ↔ DTO déléguée aux services
 * - Séparation claire couches présentation/domaine
 * - Responsabilité unique : gestion HTTP
 *
 * @author Équipe MDD
 * @version 2.0 - Clean Architecture
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
     */
    @GetMapping
    public ResponseEntity<Page<SubjectDTO>> getAllSubjects(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.debug("📄 GET /api/subjects - Utilisateur: {}, Page: {}, Size: {}", userEmail, page, size);

        // ✅ Service retourne UNIQUEMENT des DTOs
        Page<SubjectDTO> subjects = subjectService.getAllSubjects(userEmail, page, size);

        log.info("✅ {} sujets retournés pour {}", subjects.getNumberOfElements(), userEmail);
        return ResponseEntity.ok(subjects);
    }

    /**
     * Détail d'un sujet par son ID avec statut d'abonnement.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Long id) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.debug("🔍 GET /api/subjects/{} - Utilisateur: {}", id, userEmail);

        // ✅ Service retourne UNIQUEMENT un DTO
        SubjectDTO subject = subjectService.getSubjectById(id, userEmail);

        log.info("✅ Sujet retourné: '{}' (ID: {}) pour {}", subject.getName(), id, userEmail);
        return ResponseEntity.ok(subject);
    }

    /**
     * S'abonner à un sujet.
     */
    @PostMapping("/{id}/subscribe")
    public ResponseEntity<MessageResponse> subscribeToSubject(@PathVariable Long id) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.info("📌 POST /api/subjects/{}/subscribe - Utilisateur: {}", id, userEmail);

        // ✅ Service gère la logique métier en interne
        subjectService.subscribeToSubject(id, userEmail);

        log.info("✅ Abonnement réussi: sujet ID {} par {}", id, userEmail);
        return ResponseEntity.ok(MessageResponse.success("Abonnement réussi"));
    }

    /**
     * Se désabonner d'un sujet.
     */
    @DeleteMapping("/{id}/subscribe")
    public ResponseEntity<MessageResponse> unsubscribeFromSubject(@PathVariable Long id) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        log.info("📌 DELETE /api/subjects/{}/subscribe - Utilisateur: {}", id, userEmail);

        // ✅ Service gère la logique métier en interne
        subjectService.unsubscribeFromSubject(id, userEmail);

        log.info("✅ Désabonnement réussi: sujet ID {} par {}", id, userEmail);
        return ResponseEntity.ok(MessageResponse.success("Désabonnement réussi"));
    }
}