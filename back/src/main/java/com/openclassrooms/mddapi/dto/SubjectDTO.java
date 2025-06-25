package com.openclassrooms.mddapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/**
 * DTO pour Subject, utilisé pour création, mise à jour et lecture.
 * Correspond strictement à la table "subjects".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDTO {

    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String description;

    private LocalDateTime createdAt;
}
