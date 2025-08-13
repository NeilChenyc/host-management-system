# **B2B System Health Dashboard**  
**Tech Stack:** React + Spring Boot + PostgreSQL  

---

## **1. Project Overview**

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

\[Metrics Agents / Exporters]
↓
\[Spring Boot Backend: Ingestion API] → \[PostgreSQL]
↓                                ↑
\[Alert Evaluator & Notifier]          │
↓                                │
\[Realtime API (SSE/WebSocket)] → \[React Frontend UI]

````

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
````

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


