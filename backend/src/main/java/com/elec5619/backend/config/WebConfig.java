package com.elec5619.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.elec5619.backend.interceptor.JwtInterceptor;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private JwtInterceptor jwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/**") // 拦截所有API请求
                .excludePathPatterns(
                    "/api/auth/**",        // 排除认证相关请求（登录、注册）
                    "/swagger-ui/**",      // 排除Swagger UI
                    "/v3/api-docs/**",     // 排除API文档
                    "/api-docs/**"         // 排除API文档
                );
    }
}
