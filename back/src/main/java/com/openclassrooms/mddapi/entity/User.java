package com.openclassrooms.mddapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité représentant un utilisateur du réseau social MDD.
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
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "username")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is mandatory")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    @Column(name = "username", nullable = false, unique = true, length = 20)
    private String username;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @NotBlank(message = "Password is mandatory")
    @Column(name = "password", nullable = false)
    private String password;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Sujets auxquels l'utilisateur est abonné.
     *
     * ARCHITECTURE PROPRE :
     * - Relation JPA pure
     * - Pas d'annotations Jackson polluantes
     * - Sérialisation contrôlée par UserMapper
     * - Lazy loading pour performance
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "subscriptions",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    @Builder.Default
    private Set<Subject> subscribedSubjects = new HashSet<>();

    /**
     * Constructeur métier pour création d'utilisateur.
     */
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // ============================================================================
    // MÉTHODES MÉTIER (Business Logic)
    // ============================================================================

    /**
     * Vérifie si l'utilisateur est abonné à un sujet.
     *
     * @param subject le sujet à vérifier
     * @return true si abonné
     */
    public boolean isSubscribedTo(Subject subject) {
        return subscribedSubjects.contains(subject);
    }

    /**
     * Abonne l'utilisateur à un sujet.
     *
     * @param subject le sujet à suivre
     * @return true si ajouté (false si déjà abonné)
     */
    public boolean subscribe(Subject subject) {
        return subscribedSubjects.add(subject);
    }

    /**
     * Désabonne l'utilisateur d'un sujet.
     *
     * @param subject le sujet à ne plus suivre
     * @return true si supprimé (false si pas abonné)
     */
    public boolean unsubscribe(Subject subject) {
        return subscribedSubjects.remove(subject);
    }

    /**
     * Retourne le nombre d'abonnements.
     *
     * @return nombre de sujets suivis
     */
    public int getSubscriptionCount() {
        return subscribedSubjects.size();
    }
}