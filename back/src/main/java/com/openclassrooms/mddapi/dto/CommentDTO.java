package com.openclassrooms.mddapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {

    private Long id;

    @NotBlank(message = "Le contenu du commentaire est obligatoire")
    @Size(max = 500, message = "Le commentaire ne peut pas dépasser 500 caractères")
    private String content;

    private LocalDateTime createdAt;
    private Long authorId;
    private String authorUsername;
    private Long articleId;
    private String articleTitle;

    public CommentDTO(String content) {
        this.content = content;
    }
}
