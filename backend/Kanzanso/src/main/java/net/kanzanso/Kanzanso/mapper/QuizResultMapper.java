package net.kanzanso.Kanzanso.mapper;

import net.kanzanso.Kanzanso.dto.QuizResultDTO;
import net.kanzanso.Kanzanso.model.QuizResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuizResultMapper {

    @Mapping(target = "userId", ignore = true)
    QuizResult toEntity(QuizResultDTO dto);

    QuizResultDTO toDto(QuizResult entity);
}