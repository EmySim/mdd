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
 * **RESPONSABILITÉ** : Automatise les conversions entre entités JPA
 * et DTOs selon les besoins des spécifications MDD.
 *
 * FONCTIONNALITÉS :
 * - Conversion Entity → DTO avec mapping des relations
 * - Conversion DTO → Entity pour création
 * - Mapping automatique des champs simples
 * - Mapping manuel des relations (User, Subject)
 * - Gestion des collections (List<Article> → List<ArticleDTO>)
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
public interface ArticleMapper {

    /**
     * Convertit Article Entity → ArticleDTO.
     *
     * MAPPING AUTOMATIQUE :
     * - id, title, content, createdAt, updatedAt
     *
     * MAPPING MANUEL :
     * - authorId : extrait de author.id
     * - authorUsername : extrait de author.username
     * - subjectId : extrait de subject.id
     * - subjectName : extrait de subject.name
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
     * Convertit Liste Article Entity → Liste ArticleDTO.
     * Utilise automatiquement toDTO() pour chaque élément.
     *
     * @param articles liste d'entités à convertir
     * @return liste de DTOs correspondants
     */
    List<ArticleDTO> toDTOList(List<Article> articles);

    /**
     * Convertit ArticleDTO → Article Entity pour création.
     *
     * MAPPING AUTOMATIQUE :
     * - id, title, content (createdAt/updatedAt gérés par @CreationTimestamp/@UpdateTimestamp)
     *
     * MAPPING IGNORÉ :
     * - author, subject : seront définis par le service via les ID
     * - authorId, authorUsername, subjectId, subjectName : métadonnées read-only
     * - createdAt, updatedAt : gérés automatiquement par Hibernate
     *
     * USAGE : ArticleService utilisera ce mapping puis définira author et subject
     * via UserRepository.findById() et SubjectRepository.findById().
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