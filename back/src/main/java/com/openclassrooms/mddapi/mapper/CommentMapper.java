package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.CommentDTO;
import com.openclassrooms.mddapi.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * Mapper MapStruct pour conversion Comment Entity ↔ CommentDTO.
 *
 * **RESPONSABILITÉ** : Automatise les conversions entre entités JPA
 * et DTOs selon les besoins des spécifications MVP MDD.
 *
 * FONCTIONNALITÉS :
 * - Conversion Entity → DTO avec mapping des relations
 * - Conversion DTO → Entity pour création
 * - Mapping automatique des champs simples
 * - Mapping manuel des relations (User, Article)
 * - Gestion des collections (List<Comment> → List<CommentDTO>)
 *
 * CONFIGURATION MAPSTRUCT :
 * - componentModel = "spring" : Injection Spring automatique
 * - nullValuePropertyMappingStrategy = IGNORE : Ignore les null
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CommentMapper {

    /**
     * Convertit Comment Entity → CommentDTO.
     *
     * MAPPING AUTOMATIQUE :
     * - id, content, createdAt
     *
     * MAPPING MANUEL :
     * - authorId : extrait de author.id
     * - authorUsername : extrait de author.username
     * - articleId : extrait de article.id
     * - articleTitle : extrait de article.title
     *
     * @param comment entité à convertir
     * @return DTO correspondant
     */
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorUsername", source = "author.username")
    @Mapping(target = "articleId", source = "article.id")
    @Mapping(target = "articleTitle", source = "article.title")
    CommentDTO toDTO(Comment comment);

    /**
     * Convertit Liste Comment Entity → Liste CommentDTO.
     * Utilise automatiquement toDTO() pour chaque élément.
     *
     * @param comments liste d'entités à convertir
     * @return liste de DTOs correspondants
     */
    List<CommentDTO> toDTOList(List<Comment> comments);

    /**
     * Convertit CommentDTO → Comment Entity pour création.
     *
     * MAPPING AUTOMATIQUE :
     * - id, content (createdAt géré par @CreationTimestamp)
     *
     * MAPPING IGNORÉ :
     * - author, article : seront définis par le service via les ID
     * - authorId, authorUsername, articleId, articleTitle : métadonnées read-only
     * - createdAt : géré automatiquement par Hibernate
     *
     * USAGE : CommentService utilisera ce mapping puis définira author et article
     * via UserRepository.findById() et ArticleRepository.findById().
     *
     * @param commentDTO DTO à convertir
     * @return entité correspondante (sans relations)
     */
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "article", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Comment toEntity(CommentDTO commentDTO);
}