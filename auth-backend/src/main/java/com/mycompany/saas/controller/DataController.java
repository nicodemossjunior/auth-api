package com.mycompany.saas.controller;

import com.mycompany.saas.model.User;
import com.mycompany.saas.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/data")
public class DataController {

    @Autowired
    private AuthService authService;

    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserData() {
        User currentUser = authService.getCurrentUser();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "This is protected data for authenticated users");
        response.put("user", Map.of(
            "id", currentUser.getId(),
            "email", currentUser.getEmail(),
            "firstName", currentUser.getFirstName(),
            "lastName", currentUser.getLastName()
        ));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminData() {
        User currentUser = authService.getCurrentUser();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "This is protected data for administrators only");
        response.put("admin", Map.of(
            "id", currentUser.getId(),
            "email", currentUser.getEmail(),
            "firstName", currentUser.getFirstName(),
            "lastName", currentUser.getLastName()
        ));
        
        return ResponseEntity.ok(response);
    }
}
