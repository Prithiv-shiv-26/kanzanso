package net.kanzanso.Kanzanso.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping
    public Map<String, Object> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "API is working correctly");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
    
    @GetMapping("/cors")
    public Map<String, Object> testCors() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "CORS is configured correctly");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
}