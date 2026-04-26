package com.mycompany.saas.controller;

import com.mycompany.saas.dto.AuthDto;
import com.mycompany.saas.dto.TokenDto;
import com.mycompany.saas.dto.UserDto;
import com.mycompany.saas.model.User;
import com.mycompany.saas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<TokenDto> login(@Valid @RequestBody AuthDto authDto) {
        TokenDto token = authService.login(authDto);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody UserDto userDto) {
        User user = authService.register(userDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
}
