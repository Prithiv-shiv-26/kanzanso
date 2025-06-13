package net.kanzanso.Kanzanso.mapper;

import net.kanzanso.Kanzanso.dto.UserDTO;
import net.kanzanso.Kanzanso.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "todoIds", ignore = true)
    @Mapping(target = "journalEntryIds", ignore = true)
    @Mapping(target = "streakIds", ignore = true)
    @Mapping(target = "quizResultIds", ignore = true)
    @Mapping(target = "playlistIds", ignore = true)
    User toEntity(UserDTO dto);

    @Mapping(target = "password", ignore = true)
    UserDTO toDto(User entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "todoIds", ignore = true)
    @Mapping(target = "journalEntryIds", ignore = true)
    @Mapping(target = "streakIds", ignore = true)
    @Mapping(target = "quizResultIds", ignore = true)
    @Mapping(target = "playlistIds", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(UserDTO dto, @MappingTarget User entity);
}