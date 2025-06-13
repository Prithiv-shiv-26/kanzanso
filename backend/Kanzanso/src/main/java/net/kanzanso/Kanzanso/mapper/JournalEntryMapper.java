package net.kanzanso.Kanzanso.mapper;

import net.kanzanso.Kanzanso.dto.JournalEntryDTO;
import net.kanzanso.Kanzanso.model.JournalEntry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface JournalEntryMapper {

    @Mapping(target = "userId", ignore = true)
    JournalEntry toEntity(JournalEntryDTO dto);

    JournalEntryDTO toDto(JournalEntry entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(JournalEntryDTO dto, @MappingTarget JournalEntry entity);
}