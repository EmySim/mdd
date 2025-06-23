package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.UserDTO;
import com.openclassrooms.mddapi.entity.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO createUser(UserDTO userCreate) {

        // DB-FIRST : Construction + save direct
        // Si email/username duplicate → DataIntegrityViolationException → GlobalExceptionHandler (409)
        // TODO mettre methode dans userservice
        User user = User.builder()
                .email(userCreate.getEmail())
                .username(userCreate.getUsername())
                .password(passwordEncoder.encode(userCreate.getPassword()))
                .build();

        User savedUser = userRepository.save(user);
        log.info("✅ Utilisateur créé: {} (ID: {})", savedUser.getEmail(), savedUser.getId());
    }
}


