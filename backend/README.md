# ELEC5619 Backend - User Authentication and Management System

A comprehensive Spring Boot backend application providing user authentication, authorization, and management capabilities with JWT-based security.

## Features

- **User Authentication**: JWT-based login and registration
- **Role-Based Access Control**: Three predefined roles (USER, ADMIN, OPS)
- **User Management**: CRUD operations for users with role management
- **Database Integration**: PostgreSQL with Flyway migrations (Local or Supabase Cloud)
- **Security**: Spring Security with JWT tokens
- **Validation**: Input validation with proper error handling
- **Exception Handling**: Centralized exception handling with consistent error responses

## Technology Stack

- **Java 17**
- **Spring Boot 3.5.4**
- **Spring Security**
- **Spring Data JPA**
- **PostgreSQL** (Local or Supabase Cloud)
- **Flyway** (Database migrations)
- **JWT** (JSON Web Tokens)
- **Maven**

## Project Structure

```
src/main/java/com/elec5619/backend/
├── BackendApplication.java          # Main application class
├── controller/                      # REST controllers
│   ├── AuthController.java         # Authentication endpoints
│   ├── UserController.java         # User management endpoints
│   └── TestController.java         # Public test endpoints
├── dto/                            # Data Transfer Objects
│   ├── LoginDto.java              # Login request DTO
│   ├── UserRegistrationDto.java   # User registration DTO
│   ├── UserResponseDto.java       # User response DTO
│   └── JwtResponseDto.java        # JWT response DTO
├── entity/                         # JPA entities
│   ├── User.java                  # User entity
│   └── Role.java                  # Role entity
├── exception/                      # Exception handling
│   └── GlobalExceptionHandler.java # Global exception handler
├── repository/                     # Data access layer
│   ├── UserRepository.java        # User repository
│   └── RoleRepository.java        # Role repository
├── security/                       # Security configuration
│   ├── AuthTokenFilter.java       # JWT authentication filter
│   ├── JwtUtils.java              # JWT utility class
│   ├── UserDetailsImpl.java       # User details implementation
│   ├── UserDetailsServiceImpl.java # User details service
│   └── WebSecurityConfig.java     # Security configuration
└── service/                        # Business logic layer
    └── UserService.java           # User service
```

## Database Schema

### Users Table
- `id` (Primary Key, BIGSERIAL)
- `username` (Unique, VARCHAR(50))
- `password_hash` (VARCHAR(255))
- `email` (Unique, VARCHAR(100))
- `created_at` (TIMESTAMP)

### Roles Table
- `id` (Primary Key, BIGSERIAL)
- `name` (Unique, VARCHAR(50))

### User_Roles Table (Junction Table)
- `user_id` (Foreign Key to users.id)
- `role_id` (Foreign Key to roles.id)

## API Endpoints

### Public Endpoints
- `GET /api/public/test` - Test endpoint
- `GET /api/public/health` - Health check

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user info

### User Management Endpoints (Protected)
- `GET /api/users` - Get all users (ADMIN only)
- `GET /api/users/{id}` - Get user by ID (ADMIN or own profile)
- `PUT /api/users/{id}/roles` - Update user roles (ADMIN only)
- `DELETE /api/users/{id}` - Delete user (ADMIN only)
- `GET /api/users/by-role/{roleName}` - Get users by role (ADMIN/OPS only)

## Setup and Configuration

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher
- PostgreSQL 12 or higher (Local) OR Supabase account

### Database Setup Options

#### Option 1: Local PostgreSQL
1. Create a PostgreSQL database named `elec5619_db`
2. Update database credentials in `application.properties` if needed

#### Option 2: Supabase Cloud Database (推荐)
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/project/zphjbywuwrxwzjdbxiaq)
2. 获取数据库连接信息：
   - Database URL: `db.zphjbywuwrxwzjdbxiaq.supabase.co`
   - Database Password: 在项目设置中找到
   - Port: 5432
3. 更新 `application-supabase.properties` 中的密码
4. 使用 Supabase 配置启动应用

### Application Configuration

#### 本地数据库配置 (默认)
使用 `application.properties` 文件，包含本地 PostgreSQL 设置

#### Supabase 云数据库配置
使用 `application-supabase.properties` 文件，包含 Supabase 特定设置

### Running the Application

#### 使用本地数据库
```bash
mvn spring-boot:run
```

#### 使用 Supabase 数据库
```bash
mvn spring-boot:run -Dspring.profiles.active=supabase
```

The application will start on port 8080 and automatically create the database schema using Flyway migrations.

## Security Features

### JWT Authentication
- Stateless authentication using JWT tokens
- Configurable token expiration
- Secure token validation

### Role-Based Access Control
- **ROLE_USER**: Basic user access
- **ROLE_ADMIN**: Full system access
- **ROLE_OPS**: Operations and monitoring access

### Password Security
- BCrypt password hashing
- Secure password storage

## Data Validation

- Input validation using Bean Validation annotations
- Custom validation messages
- Comprehensive error handling

## Error Handling

- Centralized exception handling
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for debugging

## Testing

The application includes test dependencies for:
- Spring Boot Test
- Spring Security Test
- JUnit 5

## Development Notes

- The application uses Flyway for database migrations
- JWT tokens are stateless and don't require server-side storage
- All endpoints are properly secured with appropriate role requirements
- CORS is enabled for cross-origin requests
- Comprehensive logging is configured for debugging
- Supports both local PostgreSQL and Supabase cloud database

## API Usage Examples

### User Registration
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "roles": ["user"]
  }'
```

### User Login
```bash
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Access Protected Endpoint
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Supabase 连接说明

### 1. 获取连接信息
在 [Supabase Dashboard](https://supabase.com/dashboard/project/zphjbywuwrxwzjdbxiaq) 中：
- 进入 Project Settings → Database
- 复制 Connection string 或 Host, Database, Password 信息

### 2. 配置连接
编辑 `application-supabase.properties` 文件：
```properties
spring.datasource.url=jdbc:postgresql://db.zphjbywuwrxwzjdbxiaq.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=YOUR_ACTUAL_PASSWORD
```

### 3. 启动应用
```bash
mvn spring-boot:run -Dspring.profiles.active=supabase
```

### 4. 验证连接
访问 `http://localhost:8080/api/public/health` 检查应用状态

## Contributing

1. Follow the existing code structure and naming conventions
2. Add comprehensive documentation for new features
3. Include proper error handling and validation
4. Write tests for new functionality
5. Update this README for any new features or changes

## License

This project is part of the ELEC5619 course at the University of Sydney.
