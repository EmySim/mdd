package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.SubjectDTO;
import com.openclassrooms.mddapi.entity.Subject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * Mapper MapStruct pour Subject - MVP STRICT.
 *
 * **FONCTIONNALITÉS MVP UNIQUEMENT :**
 * - Conversion Entity ↔ DTO
 * - Mapping du statut d'abonnement
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SubjectMapper {

    /**
     * Convertit Subject Entity → SubjectDTO.
     * isSubscribed sera défini par le service.
     */
    @Mapping(target = "isSubscribed", ignore = true)
    SubjectDTO toDTO(Subject subject);

    /**
     * Convertit List<Subject> → List<SubjectDTO>.
     */
    List<SubjectDTO> toDTOList(List<Subject> subjects);

    /**
     * Convertit SubjectDTO → Subject Entity.
     */
    @Mapping(target = "subscribers", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Subject toEntity(SubjectDTO subjectDTO);
}