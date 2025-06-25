package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.SubjectDTO;
import com.openclassrooms.mddapi.entity.Subject;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * Mapper pour conversion Subject Entity ↔ SubjectDTO.
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SubjectMapper {

    /**
     * Convertit Entity → DTO.
     */
    SubjectDTO toDTO(Subject subject);

    /**
     * Convertit DTO → Entity.
     */
    Subject toEntity(SubjectDTO subjectDTO);

    /**
     * Convertit Liste Entity → Liste DTO.
     */
    List<SubjectDTO> toDTOList(List<Subject> subjects);

    /**
     * Met à jour une Entity existante avec les données du DTO.
     * Ignore les valeurs null du DTO.
     */
    void updateEntityFromDTO(SubjectDTO subjectDTO, @MappingTarget Subject subject);
}