package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.ArticleDTO;
import com.openclassrooms.mddapi.entity.Article;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * Mapper MapStruct pour conversion Article Entity ↔ ArticleDTO.
 * 
 * Automatise les conversions entre entités JPA et DTOs avec mapping
 * des relations User et Subject.
 */
@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ArticleMapper {

    /**
     * Convertit Article Entity vers ArticleDTO.
     * Mappe les relations author et subject vers leurs propriétés DTO.
     * 
     * @param article entité à convertir
     * @return DTO correspondant
     */
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorUsername", source = "author.username")
    @Mapping(target = "subjectId", source = "subject.id")
    @Mapping(target = "subjectName", source = "subject.name")
    ArticleDTO toDTO(Article article);

    /**
     * Convertit liste d'entités Article vers liste d'ArticleDTO.
     * 
     * @param articles liste d'entités à convertir
     * @return liste de DTOs correspondants
     */
    List<ArticleDTO> toDTOList(List<Article> articles);

    /**
     * Convertit ArticleDTO vers Article Entity pour création.
     * Les relations et timestamps sont ignorés et gérés par le service.
     * 
     * @param articleDTO DTO à convertir
     * @return entité correspondante (sans relations)
     */
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "subject", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Article toEntity(ArticleDTO articleDTO);
}