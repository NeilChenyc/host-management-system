package com.elec5619.backend.config;

import java.util.Arrays;

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
            .csrf(csrf -> csrf.disable()) // 禁用CSRF保护，便于API测试
            .cors(cors -> {})
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // 允许所有预检请求
                .requestMatchers("/api/auth/**").permitAll()  // 允许所有认证相关的请求
                .requestMatchers("/api/public/**").permitAll()  // 允许所有公共请求
                .requestMatchers("/api/users/**").permitAll()  // 允许所有用户管理请求（用于测试）
                .requestMatchers("/api/servers/**").permitAll()  // 允许服务器管理API访问
                .requestMatchers("/api/projects/**").permitAll() // 临时放行项目管理接口，待JWT集成后再收紧
                .requestMatchers("/api/alert-events/**").permitAll() // 允许告警事件API访问
                .requestMatchers("/api/alert-rules/**").permitAll() // 允许告警规则API访问
                .requestMatchers("/api/example/**").permitAll() // 允许示例API访问（用于Swagger测试）
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**").permitAll()  // 允许Swagger UI访问
                .anyRequest().authenticated()  // 其他所有请求需要认证
            )
            .httpBasic(basic -> basic.disable());  // 禁用HTTP Basic认证

        return http.build();
    }

    // 全局 CORS 配置，允许前端开发环境访问
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}