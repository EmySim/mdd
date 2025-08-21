package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.UserDTO;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

/**
 * Mapper MapStruct pour les conversions User/UserDTO.
 */
@Mapper(componentModel = "spring", uses = SubjectMapper.class)
public interface UserMapper extends EntityMapper<UserDTO, User> {

    /**
     * Convertit RegisterRequest vers User.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "subscribedSubjects", ignore = true)
    User toUser(RegisterRequest registerRequest);

    /**
     * Override pour ignorer le password dans la conversion vers DTO.
     * Méthode par défaut utilisée par EntityMapper.
     */
    @Override
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "subscribedSubjects", ignore = true)
    UserDTO toDto(User user);

    /**
     * ✅ CORRECTION - Méthode nommée pour éviter l'ambiguïté
     * Conversion avec gestion automatique des abonnements
     */
    @Named("withSubscriptions")
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "subscribedSubjects", source = "subscribedSubjects")
    UserDTO toDtoWithSubscriptions(User user);
}