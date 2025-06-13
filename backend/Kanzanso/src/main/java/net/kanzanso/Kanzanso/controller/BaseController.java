package net.kanzanso.Kanzanso.controller;

import net.kanzanso.Kanzanso.exception.UnauthorizedException;
import net.kanzanso.Kanzanso.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.servlet.http.HttpServletRequest;

public abstract class BaseController {

    @Autowired
    protected JwtUtil jwtUtil;

    protected String extractUserIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Authorization header is missing or invalid");
        }
        
        String token = authHeader.substring(7);
        
        if (!jwtUtil.validateToken(token)) {
            throw new UnauthorizedException("Invalid or expired token");
        }
        
        return jwtUtil.extractUserId(token);
    }
}