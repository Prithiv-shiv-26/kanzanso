package net.kanzanso.mapper;

import net.kanzanso.dto.QuizResultDto;
import net.kanzanso.model.QuizResult;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuizResultMapper {
    
    QuizResultDto toDto(QuizResult quizResult);
    
    QuizResult toEntity(QuizResultDto quizResultDto);
    
}