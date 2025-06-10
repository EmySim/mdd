package com.openclassrooms.mddapi.config;

import com.openclassrooms.mddapi.security.JwtAuthenticationEntryPoint;
import com.openclassrooms.mddapi.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
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
                                new AntPathRequestMatcher("/api/auth/login"),
                                new AntPathRequestMatcher("/api/auth/register"),
                                new AntPathRequestMatcher("/actuator/health"),
                                new AntPathRequestMatcher("/h2-console/**")
                        ).permitAll()
                        .requestMatchers(
                                new AntPathRequestMatcher("/api/posts/**"),
                                new AntPathRequestMatcher("/api/topics/**"),
                                new AntPathRequestMatcher("/api/users/**")
                        ).authenticated()
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        log.info("✅ SecurityFilterChain configuré avec succès");
        log.info("🔓 Endpoints publics : /api/auth/login, /api/auth/register, /actuator/health, /h2-console/**");
        log.info("🔒 Endpoints protégés : /api/posts/**, /api/topics/**, /api/users/**");

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
}