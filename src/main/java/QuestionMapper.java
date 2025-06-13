package net.kanzanso.mapper;

import net.kanzanso.dto.QuestionDto;
import net.kanzanso.model.Question;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuestionMapper {
    
    QuestionDto toDto(Question question);
    
    Question toEntity(QuestionDto questionDto);
    
}