package com.openclassrooms.mddapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité Subject (Sujet/Thème) - Clean Architecture.
 *
 * ✅ BONNE PRATIQUE : Entité pure sans pollution sérialisation
 * - Aucune annotation Jackson
 * - Domaine métier isolé
 * - Responsabilité unique : persistance
 * - Sérialisation gérée par les DTOs
 *
 * @author Équipe MDD
 * @version 2.0 - Clean Architecture
 */
@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank(message = "Subject name is mandatory")
    @Size(max = 100, message = "Subject name must not exceed 100 characters")
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Utilisateurs abonnés à ce sujet.
     *
     * ARCHITECTURE PROPRE :
     * - Relation JPA bidirectionnelle pure
     * - Pas d'annotations Jackson polluantes
     * - Lazy loading pour performance
     * - Sérialisation contrôlée par SubjectMapper
     */
    @ManyToMany(mappedBy = "subscribedSubjects", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> subscribers = new HashSet<>();

    private String description;

    /**
     * Constructeur métier pour création de sujet.
     */
    public Subject(String name) {
        this.name = name;
    }

    // ============================================================================
    // MÉTHODES MÉTIER (Business Logic)
    // ============================================================================

    /**
     * Retourne le nombre d'abonnés au sujet.
     *
     * @return nombre d'utilisateurs abonnés
     */
    public int getSubscriberCount() {
        return subscribers.size();
    }

    /**
     * Vérifie si un utilisateur est abonné au sujet.
     *
     * @param user l'utilisateur à vérifier
     * @return true si l'utilisateur est abonné
     */
    public boolean hasSubscriber(User user) {
        return subscribers.contains(user);
    }

    /**
     * Ajoute un abonné au sujet.
     *
     * @param user l'utilisateur à abonner
     * @return true si ajouté (false si déjà abonné)
     */
    public boolean addSubscriber(User user) {
        return subscribers.add(user);
    }

    /**
     * Supprime un abonné du sujet.
     *
     * @param user l'utilisateur à désabonner
     * @return true si supprimé (false si pas abonné)
     */
    public boolean removeSubscriber(User user) {
        return subscribers.remove(user);
    }

    /**
     * Vérifie si le sujet a des abonnés.
     *
     * @return true si au moins un abonné
     */
    public boolean hasSubscribers() {
        return !subscribers.isEmpty();
    }
}