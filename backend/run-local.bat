@echo off

REM Set local profile
set SPRING_PROFILES_ACTIVE=local

REM Show current profile
set SPRING

REM Run Spring Boot application
call .\mvnw.cmd spring-boot:run

pause