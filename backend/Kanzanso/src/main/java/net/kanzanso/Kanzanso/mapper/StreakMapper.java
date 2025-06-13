package net.kanzanso.Kanzanso.mapper;

import net.kanzanso.Kanzanso.dto.StreakDTO;
import net.kanzanso.Kanzanso.model.Streak;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface StreakMapper {

    @Mapping(target = "userId", ignore = true)
    Streak toEntity(StreakDTO dto);

    StreakDTO toDto(Streak entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "currentCount", ignore = true)
    @Mapping(target = "highestCount", ignore = true)
    @Mapping(target = "streakDates", ignore = true)
    @Mapping(target = "lastCompletedDate", ignore = true)
    void updateEntityFromDto(StreakDTO dto, @MappingTarget Streak entity);
}