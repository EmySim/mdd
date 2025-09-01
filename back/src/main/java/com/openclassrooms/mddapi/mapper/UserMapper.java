package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.UserDTO;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

/**
 * Mapper MapStruct pour conversions User/UserDTO.
 * 
 * Gère les conversions avec exclusion des données sensibles et support
 * des abonnements aux sujets.
 */
@Mapper(componentModel = "spring", uses = SubjectMapper.class)
public interface UserMapper extends EntityMapper<UserDTO, User> {

    /**
     * Convertit RegisterRequest vers User Entity pour création.
     * Le mot de passe et les relations sont gérés par le service.
     * 
     * @param registerRequest données d'inscription
     * @return entité User (sans password ni relations)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "subscribedSubjects", ignore = true)
    User toUser(RegisterRequest registerRequest);

    /**
     * Convertit User Entity vers UserDTO sans données sensibles.
     * Méthode par défaut de l'interface EntityMapper.
     * 
     * @param user entité à convertir
     * @return DTO sans password ni abonnements
     */
    @Override
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "subscribedSubjects", ignore = true)
    UserDTO toDto(User user);

    /**
     * Convertit User Entity vers UserDTO avec abonnements inclus.
     * Méthode nommée pour éviter l'ambiguïté avec toDto().
     * 
     * @param user entité à convertir
     * @return DTO avec abonnements inclus
     */
    @Named("withSubscriptions")
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "subscribedSubjects", source = "subscribedSubjects")
    UserDTO toDtoWithSubscriptions(User user);
}