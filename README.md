# Host Management System & B2B System Health Dashboard

> Enterprise-level host management system based on Next.js and Ant Design - Course Assignment Project

## 📋 Project Overview

This is a modern host management system developed with Next.js 15 + React 19 + Ant Design 5 + TypeScript technology stack. The system provides comprehensive device monitoring, user management, system settings and other functional modules, suitable for unified host device management in enterprise environments

**Note: This project is a course assignment project for learning and demonstrating modern frontend development technologies.**

## ✨ Key Features

### 🖥️ Device Management
- **Device Overview**: Real-time display of device status statistics and operation status charts
- **Host Management**: Device list management, add/edit/delete devices
- **Status Monitoring**: CPU and memory usage monitoring
- **Category Filtering**: Filter by device type (Web server, database server, etc.)

### 👥 User Management
- **User List**: CRUD operations for user information
- **Role Permissions**: User role assignment and permission management
- **User Groups**: Support for user group management
- **Status Management**: User enable/disable status control

### ⚙️ System Settings
- **Basic Configuration**: Site name, description, administrator email, etc.
- **Security Settings**: Login restrictions, session timeout, maintenance mode
- **Notification Settings**: Email and SMS notification switches
- **System Logs**: Operation log viewing and filtering
- **Backup Management**: Data backup and recovery functionality

### 🎨 Interface Features
- **Responsive Design**: Adapted for desktop and mobile devices
- **Modern UI**: Based on Ant Design 5 design language
- **Dark Theme**: Support for theme switching (extensible)
- **Internationalization**: Support for English interface

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 15.5.0
- **UI Library**: React 19.1.0
- **Component Library**: Ant Design 5.27.1
- **Development Language**: TypeScript 5
- **Styling Solution**: Tailwind CSS 4
- **Build Tool**: Turbopack
- **Code Standards**: ESLint 9

## 🚀 Quick Start

### Environment Requirements

- Node.js >= 18.0.0
- npm >= 8.0.0

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm run start
```

### Code Linting

```bash
npm run lint
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
