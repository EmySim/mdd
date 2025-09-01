package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.SubjectDTO;
import com.openclassrooms.mddapi.dto.response.MessageResponse;
import com.openclassrooms.mddapi.service.SubjectService;
import com.openclassrooms.mddapi.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

/**
 * Contrôleur REST pour la gestion des sujets et abonnements.
 * 
 * Endpoints : GET /api/subjects, GET /api/subjects/{id},
 * POST /api/subjects/{id}/subscribe, DELETE /api/subjects/{id}/subscribe
 */
@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    /**
     * Liste paginée de tous les sujets avec statut d'abonnement pour l'utilisateur connecté.
     * 
     * @param page numéro de page (défaut: 0)
     * @param size taille de page (défaut: 20, max: 100)
     * @return Page de SubjectDTO avec indicateur d'abonnement
     */
    @GetMapping
    public ResponseEntity<Page<SubjectDTO>> getAllSubjects(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        String userEmail = SecurityUtils.getCurrentUserEmail();
        Page<SubjectDTO> subjects = subjectService.getAllSubjects(userEmail, page, size);
        return ResponseEntity.ok(subjects);
    }

    /**
     * Récupère un sujet par son ID avec statut d'abonnement.
     * 
     * @param id ID du sujet
     * @return SubjectDTO avec indicateur d'abonnement
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Long id) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        SubjectDTO subject = subjectService.getSubjectById(id, userEmail);
        return ResponseEntity.ok(subject);
    }

    /**
     * S'abonne à un sujet.
     * 
     * @param id ID du sujet
     * @return MessageResponse de confirmation
     */
    @PostMapping("/{id}/subscribe")
    public ResponseEntity<MessageResponse> subscribeToSubject(@PathVariable Long id) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        subjectService.subscribeToSubject(id, userEmail);
        return ResponseEntity.ok(MessageResponse.success("Abonnement réussi"));
    }

    /**
     * Se désabonne d'un sujet.
     * 
     * @param id ID du sujet
     * @return MessageResponse de confirmation
     */
    @DeleteMapping("/{id}/subscribe")
    public ResponseEntity<MessageResponse> unsubscribeFromSubject(@PathVariable Long id) {
        String userEmail = SecurityUtils.getCurrentUserEmail();
        subjectService.unsubscribeFromSubject(id, userEmail);
        return ResponseEntity.ok(MessageResponse.success("Désabonnement réussi"));
    }
}