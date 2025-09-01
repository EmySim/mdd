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
 * Automatise les conversions entre entités JPA et DTOs avec mapping
 * des relations User et Article.
 */
@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CommentMapper {

    /**
     * Convertit Comment Entity vers CommentDTO.
     * Mappe les relations author et article vers leurs propriétés DTO.
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
     * Convertit liste d'entités Comment vers liste de CommentDTO.
     * 
     * @param comments liste d'entités à convertir
     * @return liste de DTOs correspondants
     */
    List<CommentDTO> toDTOList(List<Comment> comments);

    /**
     * Convertit CommentDTO vers Comment Entity pour création.
     * Les relations et timestamp sont ignorés et gérés par le service.
     * 
     * @param commentDTO DTO à convertir
     * @return entité correspondante (sans relations)
     */
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "article", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Comment toEntity(CommentDTO commentDTO);
}