package com.openclassrooms.mddapi.mapper;

import java.util.List;

/**
 * Interface générique pour les mappers MapStruct.
 * 
 * Définit les méthodes standard de conversion entre entités et DTOs.
 * 
 * @param <D> Type DTO
 * @param <E> Type Entity
 */
public interface EntityMapper<D, E> {

    /**
     * Convertit une entité vers son DTO.
     * 
     * @param entity entité à convertir
     * @return DTO correspondant
     */
    D toDto(E entity);

    /**
     * Convertit un DTO vers son entité.
     * 
     * @param dto DTO à convertir
     * @return entité correspondante
     */
    E toEntity(D dto);

    /**
     * Convertit une liste d'entités vers une liste de DTOs.
     * 
     * @param entityList liste d'entités à convertir
     * @return liste de DTOs correspondants
     */
    List<D> toDto(List<E> entityList);

    /**
     * Convertit une liste de DTOs vers une liste d'entités.
     * 
     * @param dtoList liste de DTOs à convertir
     * @return liste d'entités correspondantes
     */
    List<E> toEntity(List<D> dtoList);
}