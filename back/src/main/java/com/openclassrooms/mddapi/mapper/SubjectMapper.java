package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.SubjectDTO;
import com.openclassrooms.mddapi.entity.Subject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

/**
 * Mapper MapStruct pour conversion Subject Entity ↔ SubjectDTO.
 * 
 * Gère les conversions avec mapping du statut d'abonnement défini par le service.
 */
@Mapper(componentModel = "spring")
public interface SubjectMapper {

    SubjectMapper INSTANCE = Mappers.getMapper(SubjectMapper.class);

    /**
     * Convertit Subject Entity vers SubjectDTO.
     * Le statut d'abonnement et la liste des abonnés sont gérés par le service.
     * 
     * @param subject entité à convertir
     * @return DTO correspondant
     */
    @Mapping(target = "isSubscribed", ignore = true)
    @Mapping(target = "subscribers", ignore = true)
    SubjectDTO toDTO(Subject subject);

    /**
     * Convertit liste d'entités Subject vers liste de SubjectDTO.
     * 
     * @param subjects liste d'entités à convertir
     * @return liste de DTOs correspondants
     */
    List<SubjectDTO> toDTOList(List<Subject> subjects);

    /**
     * Convertit SubjectDTO vers Subject Entity.
     * Les relations et timestamp sont ignorés et gérés par le service.
     * 
     * @param subjectDTO DTO à convertir
     * @return entité correspondante
     */
    @Mapping(target = "subscribers", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Subject toEntity(SubjectDTO subjectDTO);
}