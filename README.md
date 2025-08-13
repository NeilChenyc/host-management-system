# **B2B System Health Dashboard**  
**Tech Stack:** React + Spring Boot + PostgreSQL  

---

## **Overview**

The **B2B System Health Dashboard** is a web application designed for **operations** and **management** teams to monitor the health of enterprise systems in real-time.  
It collects server and service metrics, visualizes **key performance indicators (KPIs)**, raises alerts when thresholds are breached, and implements **role-based access control (RBAC)** to ensure secure and tailored data access.  

---

## **Real-World Problem**

In modern B2B environments, organizations rely on multiple servers, microservices, and third-party APIs to deliver critical business functions.  
Without a centralized monitoring solution, teams face challenges such as:  

- **Delayed issue detection** — Problems are often discovered after customers report them.  
- **Lack of unified visibility** — Metrics are scattered across tools and environments.  
- **Inefficient alerting** — No automated triggers to inform relevant roles promptly.  
- **Role confusion** — Technical and management teams see the same data without context.  

**This dashboard addresses these issues** by providing **real-time monitoring, alerting, and role-specific data views** in a single, easy-to-use platform.  

---

## **Key Requirements**

1. **Metric Collection**  
   - Support both push (HTTP API) and pull (Prometheus format) methods.  
   - Store time-series metrics in a relational database with indexing.  

2. **Real-Time Visualization**  
   - Provide interactive charts for KPIs such as CPU usage, memory consumption, error rates, and latency.  
   - Live updates via Server-Sent Events (SSE) or WebSockets.  

3. **Alerting System**  
   - Configurable threshold rules.  
   - Multi-channel notifications (email, Slack webhook).  

4. **Role-Based Access Control (RBAC)**  
   - `ROLE_OPS` (Operations): full access to detailed metrics and alert configuration.  
   - `ROLE_MGMT` (Management): access to high-level summaries and read-only views.  

5. **Scalable Architecture**  
   - Backend API in Spring Boot with REST endpoints.  
   - Frontend in React with modular components and state management.  
   - PostgreSQL as the primary data store (optional TimescaleDB extension).  

---

## **Architecture**

```
[Metrics Agents / Exporters]
↓
[Spring Boot Backend: Ingestion API] → [PostgreSQL]
↓ ↑
[Alert Evaluator & Notifier] │
↓ │
[Realtime API (SSE/WebSocket)] → [React Frontend UI]
```


---

## **Tech Stack**

- **Frontend:** React 18, Vite, React Router, Zustand/Redux, ECharts  
- **Backend:** Spring Boot 3, Spring Web, Spring Security, JWT Authentication, Spring Data JPA  
- **Database:** PostgreSQL 15+ (TimescaleDB optional)  
- **Realtime:** SSE or WebSocket  
- **Deployment:** Docker Compose / Kubernetes  

---

## **Features**

- Collect metrics from servers and services via push or pull models.  
- Store and query time-series data efficiently.  
- Display real-time KPIs with interactive charts.  
- Raise alerts and send notifications when thresholds are exceeded.  
- Role-based access to control data visibility.  
- Scalable, containerized deployment.  

---

## **Quick Start (Docker)**

**1. Clone the repository**
```bash
git clone https://github.com/your-org/b2b-system-health-dashboard.git
cd b2b-system-health-dashboard
```

**2. Run with Docker Compose**
```bash
docker compose up -d --build
```

**3. Access the application**

* Frontend: `http://localhost:5173`
* Backend Health Check: `http://localhost:8080/actuator/health`

---

## **API Overview**

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

## **RBAC Roles**

* **ROLE\_OPS**: Full access to detailed metrics, can create/update alert rules.
* **ROLE\_MGMT**: Read-only access to high-level summaries and trends.

---

## **License**

This project is licensed under the MIT License.


