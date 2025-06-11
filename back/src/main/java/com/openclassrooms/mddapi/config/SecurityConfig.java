package com.openclassrooms.mddapi.config;

import com.openclassrooms.mddapi.security.JwtAuthenticationEntryPoint;
import com.openclassrooms.mddapi.security.JwtAuthenticationFilter;
import com.openclassrooms.mddapi.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import java.util.Arrays;

/**
 * Configuration de sécurité pour l'API MDD.
 *
 * Cette classe configure :
 * - L'authentification JWT
 * - Les autorisations par endpoint
 * - Le cryptage des mots de passe
 * - La gestion des erreurs d'authentification
 *
 * @author Équipe MDD
 * @version 1.0
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsServiceImpl userDetailsService;

    /**
     * Configuration de la chaîne de filtres de sécurité.
     *
     * Définit les règles d'autorisation :
     * - Endpoints publics : /api/auth/*
     * - Endpoints protégés : tout le reste
     * - Sessions : stateless (JWT)
     *
     * @param http l'objet HttpSecurity à configurer
     * @return la chaîne de filtres configurée
     * @throws Exception en cas d'erreur de configuration
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        log.info("🔒 Configuration du SecurityFilterChain pour l'API MDD");

        // Définir les endpoints comme variables
        String[] publicEndpoints = {
                "/api/auth/login",
                "/api/auth/register",
                "/h2-console/**",
                "/api/auth/status",
                "/actuator/health"
        };

        String[] protectedEndpoints = {
                "/api/posts/**",
                "/api/topics/**",
                "/api/users/**"
        };

        http
                .csrf().disable()
                .exceptionHandling()
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(
                                Arrays.stream(publicEndpoints)
                                        .map(AntPathRequestMatcher::new)
                                        .toArray(AntPathRequestMatcher[]::new)
                        ).permitAll()
                        .requestMatchers(
                                Arrays.stream(protectedEndpoints)
                                        .map(AntPathRequestMatcher::new)
                                        .toArray(AntPathRequestMatcher[]::new)
                        ).authenticated()
                        .anyRequest().authenticated()
                );

        // Configuration du provider d'authentification
        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // Logs dynamiques basés sur les vraies variables
        log.info("✅ SecurityFilterChain configuré avec succès");
        log.info("🔓 Endpoints publics : {}", String.join(", ", publicEndpoints));
        log.info("🔒 Endpoints protégés : {}", String.join(", ", protectedEndpoints));

        return http.build();
    }

    /**
     * Bean pour l'encodage des mots de passe.
     * Utilise BCrypt avec un coût de 12 pour la sécurité renforcée.
     *
     * @return l'encodeur de mot de passe BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        log.info("🔐 Configuration de l'encodeur BCrypt (strength: 12)");
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Bean pour le gestionnaire d'authentification.
     * Nécessaire pour l'authentification programmatique dans les services.
     *
     * @param authConfig la configuration d'authentification
     * @return le gestionnaire d'authentification
     * @throws Exception en cas d'erreur
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        log.info("🎯 Configuration de l'AuthenticationManager");
        return authConfig.getAuthenticationManager();
    }

    /**
     * Configuration du provider d'authentification DAO.
     * Lie le service UserDetailsService avec l'encodeur de mots de passe.
     *
     * @return provider d'authentification configuré
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        log.info("🔗 Configuration du DaoAuthenticationProvider");
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
}