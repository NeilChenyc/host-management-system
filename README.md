# Host Management System & B2B System Health Dashboard

> Enterprise-level host management system based on Next.js and Ant Design - Course Assignment Project

## 📋 Project Overview

This is a modern host management system developed with Next.js 15 + React 19 + Ant Design 5 + TypeScript technology stack. The system provides comprehensive device monitoring, user management, system settings and other functional modules, suitable for unified host device management in enterprise environments

**Note: This project is a course assignment project for learning and demonstrating modern frontend development technologies.**

## ✨ Working Functionalities

### 🔐 Authentication & Authorization
- **User Login**: JWT-based authentication with role-based access control
- **User Registration**: User registration with validation
- **Role Management**: Support for admin, operator, and manager roles
- **Token Management**: Secure token storage and refresh mechanism
- **Protected Routes**: Route protection based on user roles

### 📊 Dashboard & Overview
- **Dashboard**: Real-time system overview with key metrics
- **Auto-refresh**: Configurable auto-refresh for live data updates
- **Metrics Visualization**: Interactive charts for CPU, memory, disk, network
- **Server Statistics**: Total servers, online/offline status, health indicators

### 🖥️ Server Management
- **Server List**: View all servers with pagination and filtering
- **Server Details**: Detailed server information and metrics
- **Server Metrics**: Real-time and historical metrics display
  - CPU Usage, Memory Usage, Disk Usage
  - Network Traffic (In/Out)
  - Temperature, Load Average
- **Metrics Summary**: Average, minimum, maximum, latest values
- **Historical Data**: Time-range query with chart visualization
- **Server Status**: Online/Offline/Maintenance status tracking

### 👥 User Management
- **User List**: View all users with search and filtering
- **User CRUD**: Create, read, update, and delete users
- **Role Assignment**: Assign roles (admin, operator, manager) to users
- **User Profile**: View and update user profile information
- **Status Management**: Enable/disable user accounts

### 📁 Project Management
- **Project List**: View all projects with details
- **Project CRUD**: Create, read, update, and delete projects
- **Project Members**: Add and remove project members
- **Server Association**: Associate servers with projects

### 🚨 Alert System
- **Alert Rules**: Create, update, and delete alert rules
- **Rule Configuration**: Set thresholds for metrics (CPU, memory, disk, etc.)
- **Severity Levels**: low, medium, high, critical
- **Alert Events**: View triggered alerts with filtering
- **Alert Acknowledgment**: Acknowledge and manage alert events
- **Batch Operations**: Batch delete alert rules
- **Real-time Notifications**: Browser notifications for new alerts (with sound)

### ⚙️ Settings & Preferences
- **Account Information**: Display current user info (username, role, email)
- **Appearance Settings**:
  - Font Size: Adjustable font size (Small, Medium, Large)
  - Theme Color: Dynamic theme based on user role (admin, operator, manager)
  - Compact Mode: Toggle compact UI mode
  - Auto-collapse Sidebar: Auto-collapse sidebar with hover expand
- **Notification Settings**:
  - Enable/disable browser notifications
  - Enable/disable notification sounds
  - Test notification functionality
- **Data Management**:
  - View localStorage usage
  - Clear browser cache
  - Clear all local data
  - Reset preferences to defaults
- **Session Management**: Logout functionality

### 🎨 UI/UX Features
- **Responsive Design**: Works on desktop and mobile devices
- **Dynamic Theming**: Role-based color schemes
- **Fixed Sidebar**: Persistent sidebar navigation
- **Menu Highlighting**: Active menu item highlighting based on route
- **Loading States**: Loading indicators for async operations
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error/info notifications

### 📈 Data Visualization
- **Recharts Integration**: Interactive charts using Recharts library
- **Line Charts**: Time-series data visualization
- **Real-time Updates**: Live data updates without page refresh
- **Dynamic Scaling**: Automatic Y-axis scaling based on data range
- **Chart Configuration**: Customizable chart appearance and behavior

## 📦 Libraries and Dependencies

### Frontend Dependencies
| Library | Version | Purpose |
|---------|---------|---------|
| **next** | 15.5.0 | Next.js framework (React-based) |
| **react** | 19.1.0 | UI library |
| **react-dom** | 19.1.0 | React DOM rendering |
| **antd** | 5.27.1 | Ant Design component library |
| **@ant-design/icons** | 6.0.0 | Icon library |
| **@ant-design/nextjs-registry** | 1.1.0 | Ant Design Next.js integration |
| **@ant-design/v5-patch-for-react-19** | 1.0.3 | React 19 compatibility patch |
| **axios** | 1.12.2 | HTTP client |
| **dayjs** | 1.11.18 | Date/time manipulation |
| **recharts** | 3.2.0 | Chart visualization |

### Frontend Dev Dependencies
| Library | Version | Purpose |
|---------|---------|---------|
| **typescript** | ^5 | TypeScript compiler |
| **tailwindcss** | ^4 | CSS framework |
| **eslint** | ^9 | Code linting |
| **eslint-config-next** | 15.5.0 | Next.js ESLint config |

### Backend Dependencies
| Library | Version | Purpose |
|---------|---------|---------|
| **spring-boot-starter-parent** | 3.5.4 | Spring Boot parent POM |
| **spring-boot-starter-web** | 3.5.4 | Spring Web MVC |
| **spring-boot-starter-data-jpa** | 3.5.4 | Spring Data JPA |
| **spring-boot-starter-security** | 3.5.4 | Spring Security |
| **spring-boot-starter-validation** | 3.5.4 | Bean validation |
| **postgresql** | (runtime) | PostgreSQL JDBC driver |
| **h2** | (runtime) | H2 database (for testing) |
| **springdoc-openapi-starter-webmvc-ui** | 2.8.3 | Swagger/OpenAPI documentation |
| **jjwt-api** | 0.12.6 | JWT API |
| **jjwt-impl** | 0.12.6 | JWT implementation |
| **jjwt-jackson** | 0.12.6 | JWT Jackson support |

### Build Tools
- **Java**: 21
- **Maven**: (via Spring Boot parent)
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **Turbopack**: (Next.js built-in)

## 🚀 Quick Start Guide

### Prerequisites

**Frontend Requirements:**
- Node.js >= 18.0.0
- npm >= 8.0.0

**Backend Requirements:**
- Java 21
- Maven 3.6+
- PostgreSQL 15+ (or access to Supabase PostgreSQL)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd ELEC5619-03-Group-1
```

### Step 2: Setup Backend

```bash
cd backend
```

**Configure Database:**
- Update `src/main/resources/application.properties` with your database credentials
- Or set environment variables for Supabase connection

**Run Backend:**
```bash
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

**Access API Documentation:**
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`

### Step 3: Setup Frontend

```bash
cd ../frontend
npm install
```

**Run Frontend:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Login

1. Navigate to `http://localhost:3000/auth/login`
2. Use existing credentials or register a new account
3. Default roles: admin, operator, manager

### Running Tests

**Backend Tests:**
```bash
cd backend
mvn test
```

**Generate Test Coverage Report:**
```bash
mvn test jacoco:report
# Report location: target/site/jacoco/index.html
```

**Frontend Linting:**
```bash
cd frontend
npm run lint
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm run start
```

**Backend:**
```bash
cd backend
mvn clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## 📁 Project Structure

```
host-management-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Components directory
│   │   ├── DeviceManagement/  # Device management components
│   │   │   ├── DeviceOverview.tsx
│   │   │   └── DeviceList.tsx
│   │   ├── UserManagement/    # User management components
│   │   │   └── UserList.tsx
│   │   ├── SystemSettings/    # System settings components
│   │   │   └── SystemSettings.tsx
│   │   └── Layout/           # Layout components
│   │       └── MainLayout.tsx
│   └── lib/                  # Utility libraries
│       └── antd-registry.tsx # Ant Design style registration
├── public/                   # Static assets
├── package.json             # Project configuration
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
└── README.md               # Project documentation
```

## 🎯 Feature Demonstration

### Device Overview Page
- Display statistics for total devices, online devices, offline devices, and devices under maintenance
- Provide device status distribution charts
- Support filtering by device type

### Host Management Page
- Device list display including hostname, IP address, status, operating system, etc.
- Support adding new devices, editing device information, and deleting devices
- Provide search and status filtering functionality

### User Management Page
- User information management including username, email, role, status, etc.
- Support user permission assignment and role management
- Provide user grouping functionality

### System Settings Page
- System basic configuration management
- System log viewing and filtering
- Backup management functionality

## 📝 Development Guide

### Component Development Standards
- Use TypeScript for type definitions
- Follow React Hooks best practices
- Use functional components + Hooks pattern
- Use Ant Design component library to maintain UI consistency

### Style Standards
- Prioritize using Ant Design provided styles
- Use Tailwind CSS for custom styles
- Maintain responsive design principles

### Data Management
- Currently using mock data
- Extensible to integrate with real API interfaces
- Support CRUD operations for data

## 🔧 Configuration

### Ant Design Configuration
The project uses `@ant-design/nextjs-registry` for style management, with configuration file located at `src/lib/antd-registry.tsx`.

### TypeScript Configuration
The project enables strict mode, with configuration file `tsconfig.json`.

### Next.js Configuration
Uses Turbopack as the build tool, with configuration file `next.config.ts`.

## 📚 Learning Resources

- [Next.js Official Documentation](https://nextjs.org/docs)
- [React Official Documentation](https://react.dev/)
- [Ant Design Official Documentation](https://ant.design/)
- [TypeScript Official Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Official Documentation](https://tailwindcss.com/)

## 📄 License

This project is for learning and educational purposes only.

## 👨‍💻 Author

Course Assignment Project - Host Management System

---

**Note**: This project is a course assignment using mock data for demonstration. For actual production environment usage, real backend APIs and databases need to be integrated.

---

# **B2B System Health Dashboard**  
**Tech Stack:** React + Spring Boot + PostgreSQL  

---

## **1. Backend Project Overview**

### **Problem Statement**
In modern B2B environments, enterprise systems consist of multiple servers, microservices, and third-party integrations. Without a unified monitoring platform, teams struggle with:
- **Delayed issue detection** – Problems are discovered only after customers are impacted.  
- **Fragmented visibility** – Metrics are scattered across tools and systems.  
- **Ineffective alerting** – No automated notifications to the right stakeholders.  
- **Role confusion** – Both technical and management teams see the same data without context.

### **Main Features**
- **Metric Collection** – Supports both push (HTTP API) and pull (Prometheus format) models for server and service metrics.  
- **Real-Time Visualization** – Live KPI charts (CPU usage, memory consumption, error rates, latency) using SSE/WebSocket.  
- **Alerting System** – Configurable threshold rules with multi-channel notifications (email, Slack).  
- **Role-Based Access Control (RBAC)** – Secure and tailored views for Operations and Management teams.  
- **Scalable Architecture** – Modular backend, modern frontend, and efficient time-series data storage.

### **High-Level Goals**
- Enable **fast detection** of infrastructure and application issues.  
- Provide **unified visibility** into system health for all stakeholders.  
- Automate **alerting** to reduce downtime and improve incident response.  
- Ensure **secure, role-specific** access to relevant information.  

---

## **2. Team Roles & Responsibilities**

| Team Member  | Role               | Responsibilities |
|--------------|--------------------|------------------|
| Hao Tian     | Frontend Lead      | Designs and implements the React-based user interface, integrates API endpoints, creates responsive KPI charts, and manages application state using Redux/Zustand. |
| Yuyang Ai    | Backend Lead       | Develops Spring Boot REST APIs, implements metrics ingestion and querying logic, integrates alerting engine, and handles database schema design in PostgreSQL. |
| Yuanchao Chen| DevOps & Infrastructure | Sets up Docker Compose and Kubernetes deployments, configures CI/CD pipelines, manages environment variables and application scaling, and ensures secure and reliable deployments. |
| Junya You    | Full-Stack Developer & QA | Assists both frontend and backend development, implements RBAC features, writes unit/integration tests, performs API testing, and ensures quality through automated test pipelines. |
| Yurou Chen | UI/UX Designer | Designs user-friendly and visually appealing UI layouts, improves dashboard usability, conducts user testing, and collaborates with the frontend team to implement design changes. |

---

## **3. Architecture Diagram**

```
[Metrics Agents / Exporters]
↓
[Spring Boot Backend: Ingestion API] → [PostgreSQL]
↓                                ↑
[Alert Evaluator & Notifier]          │
↓                                │
[Realtime API (SSE/WebSocket)] → [React Frontend UI]
```

---

## **4. Tech Stack**

- **Frontend:** React 18, Vite, React Router, Zustand/Redux, ECharts  
- **Backend:** Spring Boot 3, Spring Web, Spring Security, JWT Authentication, Spring Data JPA  
- **Database:** PostgreSQL 15+ (TimescaleDB optional)  
- **Realtime:** SSE or WebSocket  
- **Deployment:** Docker Compose / Kubernetes  

---

## **5. Key Features**

- Collect and store time-series metrics efficiently.  
- Display real-time KPIs with interactive charts.  
- Raise alerts based on defined rules and thresholds.  
- Provide different data views for different user roles.  
- Deployable in containerized and cloud environments.

---

## **6. Quick Start (Docker)**

**Clone the repository**
```bash
git clone https://github.com/your-org/b2b-system-health-dashboard.git
cd b2b-system-health-dashboard
```

**Run with Docker Compose**

```bash
docker compose up -d --build
```

**Access the application**

* Frontend: `http://localhost:5173`
* Backend Health Check: `http://localhost:8080/actuator/health`

---

## **7. API Overview**

* **Auth**
  `POST /auth/login` → Returns JWT token.

* **Metrics**
  `POST /api/v1/metrics` → Push metrics data.
  `GET /metrics` → Prometheus-compatible metrics endpoint.

* **KPIs**
  `GET /api/v1/kpis` → Fetch aggregated KPI data.

* **Alerts**
  `GET /api/v1/alerts` → List alerts.
  `POST /api/v1/rules` → Create alert rule.

* **Realtime**
  `GET /api/v1/realtime/overview` → SSE stream for live dashboard updates.

---

## **8. RBAC Roles**

* **ROLE\_OPS**: Full access to detailed metrics, can manage alert rules.
* **ROLE\_MGMT**: Read-only access to high-level summaries and trends.

---

## **9. License**

This project is licensed under the MIT License.

## **10. Database Structure**

**`users` Table**
* `id` (Primary Key)
* `username` (Unique)
* `password_hash`
* `email` (Unique)
* `created_at`

**`roles` Table**
* `id` (Primary Key)
* `name` (Unique, e.g., 'ROLE_OPS')

**`user_roles` Table**
* `user_id` (Foreign Key to `users.id`)
* `role_id` (Foreign Key to `roles.id`)
