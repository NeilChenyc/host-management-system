package com.elec5619.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // 禁用CSRF保护，便于API测试
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // 允许所有认证相关的请求
                .requestMatchers("/api/public/**").permitAll()  // 允许所有公共请求
                .requestMatchers("/api/users/**").permitAll()  // 允许所有用户管理请求（用于测试）
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**").permitAll()  // 允许Swagger UI访问
                .anyRequest().authenticated()  // 其他所有请求需要认证
            )
            .httpBasic(basic -> basic.disable());  // 禁用HTTP Basic认证

        return http.build();
    }

    // 确保BCryptPasswordEncoder可用
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}