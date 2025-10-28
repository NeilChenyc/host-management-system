package com.elec5619.backend.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 禁用 CSRF（适用于 REST API）
            .csrf(csrf -> csrf.disable())
            // 启用 CORS（结合 corsConfigurationSource()）
            .cors(cors -> {})
            .authorizeHttpRequests(auth -> auth
                // 允许所有 OPTIONS 预检请求
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 放行特定 API（用于前端开发调试）
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/api/servers/**").permitAll()
                .requestMatchers("/api/projects/**").permitAll()
                .requestMatchers("/api/alert-events/**").permitAll()
                .requestMatchers("/api/alert-rules/**").permitAll()
                .requestMatchers("/api/example/**").permitAll()

                // Swagger & OpenAPI
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**").permitAll()

                // 其他接口需登录认证
                .anyRequest().authenticated()
            )
            // 禁用 HTTP Basic（改用 JWT 认证）
            .httpBasic(basic -> basic.disable());

        return http.build();
    }

    /**
     * 全局 CORS 配置 —— 允许前端 localhost:3000 访问 8081
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * 密码加密算法（BCrypt）
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
