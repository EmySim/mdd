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
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

/**
 * Configuration de sécurité pour l'API MDD.
 * 
 * Gère l'authentification JWT, les autorisations et le cryptage des mots de passe.
 * Endpoints publics : /api/auth/**, /actuator/health
 * Endpoints protégés : /api/** (nécessitent un token JWT valide)
 * 
 * @author Équipe MDD
 * @version 2.0
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
     * Sessions stateless avec authentification JWT.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        log.info("🔒 Configuration SecurityFilterChain");

        http.cors() // Active CORS
                .and()
                .csrf().disable()
                .exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests(authz -> authz
                        .antMatchers("/api/auth/**").permitAll()
                        .antMatchers("/actuator/health").permitAll()
                        .antMatchers("/h2-console/**").permitAll()
                        .antMatchers("/api/**").authenticated()
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        log.info("✅ SecurityFilterChain configuré - Publics: /api/auth/**, /actuator/health");
        log.info("🔒 Endpoints protégés: /api/** (JWT requis)");
        
        return http.build();
    }

    /**
     * Encodeur BCrypt pour les mots de passe.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        log.info("🔐 PasswordEncoder BCrypt configuré (strength: 12)");
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Gestionnaire d'authentification pour l'injection dans les services.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        log.info("🎯 AuthenticationManager configuré");
        return authConfig.getAuthenticationManager();
    }

    /**
     * Provider d'authentification liant UserDetailsService et PasswordEncoder.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        log.info("🔗 DaoAuthenticationProvider configuré");
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Configuration du HttpFirewall pour gérer les doubles slashs dans les URLs.
     * Permet d'éviter les RequestRejectedException avec "//" dans les URLs.
     */
    @Bean
    public HttpFirewall allowUrlEncodedSlashHttpFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowUrlEncodedSlash(true);
        firewall.setAllowUrlEncodedPercent(true);
        firewall.setAllowUrlEncodedPeriod(true);
        log.info("🔓 HttpFirewall configuré - URL slashes autorisés");
        return firewall;
    }

    /**
     * Personnalisation de la sécurité web.
     * - Configure le firewall personnalisé pour gérer les URL avec doubles slashes
     * - Ignore la sécurité pour H2 console en développement
     */
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> {
            web.httpFirewall(allowUrlEncodedSlashHttpFirewall());
            web.ignoring().antMatchers("/h2-console/**");
        };
    }
}