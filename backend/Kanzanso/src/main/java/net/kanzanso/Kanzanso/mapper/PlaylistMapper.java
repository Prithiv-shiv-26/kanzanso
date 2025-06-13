package net.kanzanso.Kanzanso.mapper;

import net.kanzanso.Kanzanso.dto.PlaylistDTO;
import net.kanzanso.Kanzanso.model.Playlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PlaylistMapper {

    @Mapping(target = "userId", ignore = true)
    Playlist toEntity(PlaylistDTO dto);

    PlaylistDTO toDto(Playlist entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(PlaylistDTO dto, @MappingTarget Playlist entity);

    Playlist.Track toTrackEntity(PlaylistDTO.TrackDTO dto);
    
    PlaylistDTO.TrackDTO toTrackDto(Playlist.Track entity);
}