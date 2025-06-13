package net.kanzanso.Kanzanso.mapper;

import net.kanzanso.Kanzanso.dto.TodoItemDTO;
import net.kanzanso.Kanzanso.model.TodoItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        uses = {SubTaskMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TodoItemMapper {

    @Mapping(target = "userId", ignore = true)
    TodoItem toEntity(TodoItemDTO dto);

    TodoItemDTO toDto(TodoItem entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(TodoItemDTO dto, @MappingTarget TodoItem entity);
}