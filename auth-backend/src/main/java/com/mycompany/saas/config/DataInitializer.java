package com.mycompany.saas.config;

import com.mycompany.saas.model.Role;
import com.mycompany.saas.model.User;
import com.mycompany.saas.repository.RoleRepository;
import com.mycompany.saas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeAdminUser();
    }

    private void initializeRoles() {
        if (roleRepository.count() == 0) {
            Role userRole = Role.builder()
                    .id(1)
                    .name("ROLE_USER")
                    .build();
            
            Role adminRole = Role.builder()
                    .id(2)
                    .name("ROLE_ADMIN")
                    .build();

            roleRepository.saveAll(List.of(userRole, adminRole));
            System.out.println("Default roles initialized");
        }
    }

    private void initializeAdminUser() {
        if (!userRepository.existsByEmail("admin@example.com")) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("admin123"))
                    .roles(List.of(adminRole))
                    .build();

            userRepository.save(admin);
            System.out.println("Default admin user created: admin@example.com / admin123");
        }
    }
}
