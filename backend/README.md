# Backend - Host Management System

> Spring Boot REST API backend for the Host Management System

## 📋 Overview

This is a Spring Boot 3.5.4 based REST API backend that provides comprehensive functionality for managing servers, users, projects, metrics, and alerts. The system uses JWT-based authentication, role-based access control (RBAC), and PostgreSQL for data persistence.

## 🛠️ Technology Stack

| Component | Version/Technology | Purpose |
|-----------|-------------------|---------|
| **Java** | 21 | Programming language |
| **Spring Boot** | 3.5.4 | Framework |
| **Spring Security** | 3.5.4 | Authentication & Authorization |
| **Spring Data JPA** | 3.5.4 | Database access |
| **PostgreSQL** | 15+ | Primary database |
| **H2 Database** | (runtime) | Testing database |
| **JJWT** | 0.12.6 | JWT token generation/validation |
| **Springdoc OpenAPI** | 2.8.3 | API documentation (Swagger) |
| **Maven** | 3.6+ | Build tool |

## 📦 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/elec5619/backend/
│   │   │   ├── BackendApplication.java          # Main application class
│   │   │   ├── config/                          # Configuration classes
│   │   │   │   ├── SecurityConfig.java         # Spring Security configuration
│   │   │   │   ├── WebConfig.java              # Web configuration
│   │   │   │   ├── OpenApiConfig.java          # Swagger/OpenAPI configuration
│   │   │   │   └── AlertRuleInitializer.java   # Sample data initialization
│   │   │   ├── controller/                     # REST controllers
│   │   │   │   ├── AuthController.java         # Authentication endpoints
│   │   │   │   ├── UserController.java         # User management endpoints
│   │   │   │   ├── ServerController.java       # Server management endpoints
│   │   │   │   ├── ServerMetricsController.java # Metrics endpoints
│   │   │   │   ├── ProjectController.java      # Project management endpoints
│   │   │   │   ├── AlertRuleController.java    # Alert rule endpoints
│   │   │   │   ├── AlertEventController.java   # Alert event endpoints
│   │   │   │   └── TestController.java         # Public test endpoints
│   │   │   ├── service/                        # Business logic layer
│   │   │   │   ├── UserService.java
│   │   │   │   ├── ServerService.java
│   │   │   │   ├── ServerMetricsService.java
│   │   │   │   ├── ProjectService.java
│   │   │   │   ├── AlertRuleService.java
│   │   │   │   ├── AlertEventService.java
│   │   │   │   ├── AlertSystemService.java     # Alert evaluation engine
│   │   │   │   ├── NotificationService.java
│   │   │   │   └── RoleService.java
│   │   │   ├── repository/                     # Data access layer
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ServerRepository.java
│   │   │   │   ├── ServerMetricsRepository.java
│   │   │   │   ├── ProjectRepository.java
│   │   │   │   ├── ProjectMemberRepository.java
│   │   │   │   ├── AlertRuleRepository.java
│   │   │   │   └── AlertEventRepository.java
│   │   │   ├── entity/                         # JPA entities
│   │   │   │   ├── User.java
│   │   │   │   ├── Server.java
│   │   │   │   ├── ServerMetrics.java
│   │   │   │   ├── Project.java
│   │   │   │   ├── AlertRule.java
│   │   │   │   └── AlertEvent.java
│   │   │   ├── dto/                            # Data Transfer Objects
│   │   │   │   ├── UserRegistrationDto.java
│   │   │   │   ├── UserResponseDto.java
│   │   │   │   ├── ServerCreateDto.java
│   │   │   │   ├── ServerResponseDto.java
│   │   │   │   └── ... (other DTOs)
│   │   │   ├── util/                           # Utility classes
│   │   │   │   ├── JwtUtil.java                # JWT token utilities
│   │   │   │   └── PermissionChecker.java      # Permission validation
│   │   │   ├── interceptor/                    # Interceptors
│   │   │   │   └── JwtInterceptor.java         # JWT validation interceptor
│   │   │   ├── exception/                      # Exception handling
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ... (custom exceptions)
│   │   │   ├── constants/                      # Constants
│   │   │   │   └── PermissionConstants.java
│   │   │   └── scheduler/                      # Scheduled tasks
│   │   │       ├── MetricsDataGenerator.java   # Generate sample metrics
│   │   │       └── AlertEvaluationScheduler.java # Evaluate alert rules
│   │   └── resources/
│   │       └── application.properties          # Application configuration
│   └── test/                                    # Test files
└── pom.xml                                     # Maven configuration
```

## 🚀 Quick Start

### Prerequisites

- **Java 21** or higher
- **Maven 3.6+**
- **PostgreSQL 15+** (or access to Supabase PostgreSQL)
- **IDE** (IntelliJ IDEA, Eclipse, or VS Code)

### Step 1: Database Setup

1. **Using Supabase (Default):**
   - The application is pre-configured to use Supabase PostgreSQL
   - Update `src/main/resources/application.properties` with your credentials:
     ```properties
     spring.datasource.url=jdbc:postgresql://your-supabase-url:6543/postgres
     spring.datasource.username=your-username
     spring.datasource.password=your-password
     ```

2. **Using Local PostgreSQL:**
   - Install PostgreSQL and create a database:
     ```sql
     CREATE DATABASE host_management;
     ```
   - Update `application.properties`:
     ```properties
     spring.datasource.url=jdbc:postgresql://localhost:5432/host_management
     spring.datasource.username=postgres
     spring.datasource.password=your-password
     ```

### Step 2: Build and Run

```bash
# Navigate to backend directory
cd backend

# Clean and build
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Step 3: Verify Installation

- **Health Check:** `http://localhost:8080/api/public/health`
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/api-docs`

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/signin` | Login and get JWT token | No |

### User Management (`/api/users`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/users` | Get all users | All |
| GET | `/api/users/{id}` | Get user by ID | All |
| PUT | `/api/users/{id}/role` | Update user role | Admin |
| PUT | `/api/users/{id}` | Update user profile | All |
| DELETE | `/api/users/{id}` | Delete user | Admin |

### Server Management (`/api/servers`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/servers` | List all servers | All |
| GET | `/api/servers/{id}` | Get server by ID | All |
| POST | `/api/servers` | Create new server | Admin, Manager |
| PUT | `/api/servers/{id}` | Update server | Admin, Manager |
| DELETE | `/api/servers/{id}` | Delete server | Admin, Manager |
| GET | `/api/servers/overview` | Get server overview stats | All |

### Server Metrics (`/api/servers/{serverId}/metrics`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/servers/{serverId}/metrics` | Push metrics data | All |
| GET | `/api/servers/{serverId}/metrics/latest` | Get latest metrics | All |
| GET | `/api/servers/{serverId}/metrics/summary` | Get metrics summary | All |
| GET | `/api/servers/{serverId}/metrics/range` | Get metrics in time range | All |

**Time Range Parameters:**
- `startTime`: ISO 8601 format (e.g., `2025-11-01T00:00:00`)
- `endTime`: ISO 8601 format
- Maximum range: 30 days

### Project Management (`/api/projects`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/projects` | List all projects | All |
| GET | `/api/projects/{id}` | Get project by ID | All |
| POST | `/api/projects` | Create new project | Admin, Manager |
| PUT | `/api/projects/{id}` | Update project | Admin, Manager |
| DELETE | `/api/projects/{id}` | Delete project | Admin, Manager |
| POST | `/api/projects/{id}/members` | Add project member | Admin, Manager |
| DELETE | `/api/projects/{id}/members/{userId}` | Remove project member | Admin, Manager |

### Alert Rules (`/api/alert-rules`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/alert-rules` | List all alert rules | All |
| GET | `/api/alert-rules/{id}` | Get alert rule by ID | All |
| POST | `/api/alert-rules` | Create alert rule | Admin, Operator |
| POST | `/api/alert-rules/batch` | Create multiple rules | Admin, Operator |
| PUT | `/api/alert-rules/{id}` | Update alert rule | Admin, Operator |
| DELETE | `/api/alert-rules/{id}` | Delete alert rule | Admin, Operator |
| DELETE | `/api/alert-rules/batch` | Batch delete rules | Admin, Operator |

**Alert Rule Fields:**
- `name`: Rule name (unique per server)
- `serverId`: Associated server ID (optional for global rules)
- `metricType`: CPU, MEMORY, DISK, TEMPERATURE, NETWORK_IN, NETWORK_OUT
- `threshold`: Threshold value
- `operator`: GT (greater than), LT (less than), EQ (equals)
- `severity`: low, medium, high, critical

### Alert Events (`/api/alert-events`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/alert-events` | List alert events | All |
| GET | `/api/alert-events/{id}` | Get alert event by ID | All |
| PUT | `/api/alert-events/{id}/acknowledge` | Acknowledge alert | All |
| GET | `/api/alert-events/statistics` | Get alert statistics | All |

### Public Endpoints (`/api/public`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/test` | Test endpoint |
| GET | `/api/public/health` | Health check |

## 🔐 Authentication & Authorization

### JWT Token

- **Token Format:** `Bearer <token>`
- **Expiration:** 24 hours (86400000 ms)
- **Header:** `Authorization: Bearer <token>`

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **admin** | System administrator | Full access to all resources |
| **operator** | Operations team | Manage servers, metrics, alerts |
| **manager** | Project manager | Manage projects, view reports |

### Permission Constants

Located in `PermissionConstants.java`:
- `USER_READ_ALL`: View all users
- `USER_WRITE_ALL`: Create/update/delete users
- `SERVER_MANAGE_ALL`: Full server management
- `PROJECT_WRITE_ALL`: Create/update/delete projects
- `ALERT_RULE_WRITE`: Create/update/delete alert rules

## 🗄️ Database Schema

### Core Entities

**Users Table**
- `id` (PK)
- `username` (Unique)
- `email` (Unique)
- `password_hash`
- `role` (admin, operator, manager)
- `created_at`, `updated_at`

**Servers Table**
- `id` (PK)
- `server_name` (Unique)
- `ip_address`
- `status` (ONLINE, OFFLINE, MAINTENANCE)
- `os_type`, `os_version`
- `created_at`, `updated_at`

**ServerMetrics Table**
- `id` (PK)
- `server_id` (FK)
- `cpu_usage`, `memory_usage`, `disk_usage`
- `network_in`, `network_out`
- `temperature`, `load_avg`
- `collected_at`

**Projects Table**
- `id` (PK)
- `name` (Unique)
- `description`
- `status` (ACTIVE, INACTIVE, COMPLETED)
- `start_date`, `end_date`
- `created_at`, `updated_at`

**AlertRules Table**
- `id` (PK)
- `server_id` (FK, nullable for global rules)
- `name` (unique per server)
- `metric_type`
- `threshold`, `operator`
- `severity` (low, medium, high, critical)
- `enabled` (boolean)
- `created_at`, `updated_at`

**AlertEvents Table**
- `id` (PK)
- `alert_rule_id` (FK)
- `server_id` (FK)
- `metric_value`, `threshold`
- `severity`
- `status` (ACTIVE, ACKNOWLEDGED, RESOLVED)
- `triggered_at`, `acknowledged_at`, `resolved_at`

## ⚙️ Configuration

### Application Properties

Key configuration in `src/main/resources/application.properties`:

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://...
spring.datasource.username=...
spring.datasource.password=...

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# Swagger
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

### Environment Variables

For production, use environment variables:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`

## 🔄 Scheduled Tasks

### Metrics Data Generator

- **Frequency:** Every 5 minutes
- **Purpose:** Generates sample server metrics for testing
- **Class:** `MetricsDataGenerator`

### Alert Evaluation Scheduler

- **Frequency:** Every 1 minute
- **Purpose:** Evaluates alert rules against current metrics
- **Class:** `AlertEvaluationScheduler`
- **Actions:**
  - Checks all enabled alert rules
  - Compares current metrics with thresholds
  - Creates alert events when conditions are met
  - Triggers notifications (if configured)

## 🧪 Testing

### Run All Tests

```bash
mvn test
```

### Generate Coverage Report

```bash
mvn test jacoco:report
```

Coverage report location: `target/site/jacoco/index.html`

### Test Endpoints

All controller classes have corresponding test classes:
- `*ControllerTest.java`
- Uses `@WebMvcTest` and `@MockitoBean` (Spring Boot 3.4+)
- Tests authentication, authorization, and business logic

## 🐛 Error Handling

### Custom Exceptions

- `BusinessException`: General business logic errors
- `PermissionException`: Authorization failures
- `UserNotFoundException`: User not found
- `ServerNotFoundException`: Server not found
- `ProjectNotFoundException`: Project not found
- `ServerNameAlreadyExistsException`: Duplicate server name
- `ProjectNameAlreadyExistsException`: Duplicate project name

### Global Exception Handler

`GlobalExceptionHandler.java` provides centralized error handling:
- Returns consistent error response format
- Maps exceptions to HTTP status codes
- Logs errors for debugging

## 📝 API Documentation

### Swagger UI

Access at: `http://localhost:8080/swagger-ui.html`

Features:
- Interactive API testing
- Request/response examples
- Authentication testing with JWT tokens
- Tag-based organization

### OpenAPI Specification

JSON format: `http://localhost:8080/api-docs`

## 🚀 Production Deployment

### Build JAR

```bash
mvn clean package
```

JAR location: `target/backend-0.0.1-SNAPSHOT.jar`

### Run JAR

```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Docker (Future)

```dockerfile
FROM openjdk:21-jdk-slim
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [Spring Data JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [JJWT Documentation](https://github.com/jwtk/jjwt)

## 👥 Contributors

- Yuyang Ai (Backend Lead)
- Team Members (see main README)

## 📄 License

This project is for educational purposes only.

