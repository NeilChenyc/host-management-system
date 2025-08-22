# Host Management System

> Enterprise-level host management system based on Next.js and Ant Design - Course Assignment Project

## 📋 Project Overview

This is a modern host management system developed with Next.js 15 + React 19 + Ant Design 5 + TypeScript technology stack. The system provides comprehensive device monitoring, user management, system settings and other functional modules, suitable for unified host device management in enterprise environments.

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
