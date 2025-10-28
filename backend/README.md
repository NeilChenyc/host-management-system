# Spring Boot Backend Application

## 项目概述
一个基于Spring Boot的后端应用，提供用户认证、授权和管理功能，采用JWT安全机制。

## 核心功能
- 用户认证：基于JWT的登录和注册
- 基于角色的访问控制：三种预定义角色（USER、ADMIN、OPS）
- 用户管理：带角色管理的用户CRUD操作
- 数据库集成：PostgreSQL（本地或Supabase云数据库）和Flyway迁移
- 安全性：带JWT令牌的Spring Security
- 输入验证和异常处理

## 技术栈
- Java 17
- Spring Boot 3.5.4
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway（数据库迁移）
- JWT（JSON Web Tokens）
- Maven

## 项目结构
```
src/main/java/com/elec5619/backend/
├── BackendApplication.java          # 主应用类
├── controller/                      # REST控制器
├── dto/                            # 数据传输对象
├── entity/                         # JPA实体
├── exception/                      # 异常处理
├── repository/                     # 数据访问层
├── security/                       # 安全配置
└── service/                        # 业务逻辑层
```

## 数据库设置

### 选项1：本地PostgreSQL
1. 创建名为`elec5619_db`的PostgreSQL数据库
2. 如需更改数据库凭证，更新`application.properties`文件

### 选项2：Supabase云数据库（推荐）
1. 访问Supabase Dashboard
2. 获取数据库连接信息
3. 更新`application-supabase.properties`中的密码
4. 使用Supabase配置启动应用

## 运行应用

### 使用本地数据库
```bash
mvn spring-boot:run
```

### 使用Supabase数据库
```bash
mvn spring-boot:run -Dspring.profiles.active=supabase
```

应用将在端口8080启动，并通过Flyway自动创建数据库模式。

## 主要API端点

### 公共端点
- `GET /api/public/test` - 测试端点
- `GET /api/public/health` - 健康检查

### 认证端点
- `POST /api/auth/signup` - 用户注册
- `POST /api/auth/signin` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 用户管理端点（受保护）
- `GET /api/users` - 获取所有用户（仅ADMIN）
- `GET /api/users/{id}` - 获取特定用户（ADMIN或自己的配置文件）
- `PUT /api/users/{id}/roles` - 更新用户角色（仅ADMIN）
- `DELETE /api/users/{id}` - 删除用户（仅ADMIN）
- `GET /api/users/by-role/{roleName}` - 按角色获取用户（仅ADMIN/OPS）

## 安全机制
- JWT无状态认证
- 基于角色的访问控制
- BCrypt密码哈希安全存储
