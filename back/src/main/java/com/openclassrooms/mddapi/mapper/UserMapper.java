package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.UserDTO;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

/**
 * Mapper MapStruct pour les conversions User/UserDTO.
 */
@Component
@Mapper(componentModel = "spring")
public interface UserMapper extends EntityMapper<UserDTO, User> {

    /**
     * Convertit RegisterRequest vers User.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "password", ignore = true)
    User toUser(RegisterRequest registerRequest);

    /**
     * Override pour ignorer le password dans la conversion vers DTO.
     */
    @Override
    @Mapping(target = "password", ignore = true)
    UserDTO toDto(User user);
}