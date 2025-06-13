package net.kanzanso.Kanzanso.service;

import net.kanzanso.Kanzanso.dto.LoginRequest;
import net.kanzanso.Kanzanso.dto.LoginResponse;
import net.kanzanso.Kanzanso.dto.UserDTO;
import net.kanzanso.Kanzanso.exception.BadRequestException;
import net.kanzanso.Kanzanso.exception.ResourceNotFoundException;
import net.kanzanso.Kanzanso.exception.UnauthorizedException;
import net.kanzanso.Kanzanso.mapper.UserMapper;
import net.kanzanso.Kanzanso.model.User;
import net.kanzanso.Kanzanso.repository.UserRepository;
import net.kanzanso.Kanzanso.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    
    @Autowired
    public UserService(UserRepository userRepository, UserMapper userMapper, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
    }
    
    public UserDTO createUser(UserDTO userDTO) {
        // Check if email already exists
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        
        // Convert DTO to entity
        User user = userMapper.toEntity(userDTO);
        
        // Set additional fields
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        // Convert to DTO and return
        return userMapper.toDto(savedUser);
    }
    
    public LoginResponse login(LoginRequest loginRequest) {
        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOptional.isEmpty()) {
            throw new UnauthorizedException("Invalid email or password");
        }
        
        User user = userOptional.get();
        
        // Check password (in a real app, you would compare hashed passwords)
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        
        // Return login response
        return LoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .token(token)
                .build();
    }
    
    public UserDTO getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        return userMapper.toDto(user);
    }
    
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        return userMapper.toDto(user);
    }
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }
    
    public UserDTO updateUser(String id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        // Only update email if it's changed and not already taken
        if (!user.getEmail().equals(userDTO.getEmail())) {
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
        }
        
        // Update entity from DTO
        userMapper.updateEntityFromDto(userDTO, user);
        
        // Update password if provided
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(userDTO.getPassword()); // In a real app, you would hash the password
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        
        return userMapper.toDto(updatedUser);
    }
    
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        
        userRepository.deleteById(id);
    }
    
    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }
}