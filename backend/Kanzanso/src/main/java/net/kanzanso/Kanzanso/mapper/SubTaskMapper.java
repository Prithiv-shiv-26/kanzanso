package net.kanzanso.Kanzanso.mapper;

import net.kanzanso.Kanzanso.dto.SubTaskDTO;
import net.kanzanso.Kanzanso.model.SubTask;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

/**
 * Mapper for converting between SubTask entity and SubTaskDTO
 */
@Mapper(componentModel = "spring")
public interface SubTaskMapper {
    
    /**
     * Convert DTO to entity
     * @param dto SubTaskDTO
     * @return SubTask entity
     */
    SubTask toEntity(SubTaskDTO dto);
    
    /**
     * Convert entity to DTO
     * @param entity SubTask entity
     * @return SubTaskDTO
     */
    SubTaskDTO toDto(SubTask entity);
    
    /**
     * Update entity from DTO
     * @param dto SubTaskDTO with updated values
     * @param entity SubTask entity to update
     */
    void updateEntityFromDto(SubTaskDTO dto, @MappingTarget SubTask entity);
}