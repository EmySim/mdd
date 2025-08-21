package com.openclassrooms.mddapi.mapper;

import java.util.List;

/**
 * Interface générique pour les mappers MapStruct.
 * 
 * @param <D> Type DTO
 * @param <E> Type Entity
 */
public interface EntityMapper<D, E> {

    /**
     * Convertit Entity vers DTO.
     */
    D toDto(E entity);

    /**
     * Convertit DTO vers Entity.
     */
    E toEntity(D dto);

    /**
     * Convertit une liste d'Entities vers une liste de DTOs.
     */
    List<D> toDto(List<E> entityList);

    /**
     * Convertit une liste de DTOs vers une liste d'Entities.
     */
    List<E> toEntity(List<D> dtoList);
}