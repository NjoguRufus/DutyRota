# CAPE MEDIA SUPPORT STAFF DUTY ROTA MANAGEMENT SYSTEM

## Project Overview

The Cape Media Support Staff Duty Rota Management System is a web-based application designed to help Cape Media manage the duty schedules of their support staff. The system provides separate interfaces for administrators and staff members, making it easy to create schedules, manage employees, and view assigned shifts.

This project was developed as part of the CAPE Information Technology coursework to demonstrate practical skills in web application development using modern technologies.

---

## Problem Statement

Cape Media currently faces challenges in managing their support staff duty schedules. The manual process of creating and distributing duty rotas is time-consuming, prone to errors, and makes it difficult for staff members to access their schedules. There is a need for a centralized system that allows administrators to efficiently manage employee schedules while giving staff members easy access to view their assigned shifts.

---

## Objectives of the System

1. To provide administrators with tools to manage employee records (add, edit, delete employees)
2. To enable administrators to create and manage duty rota schedules
3. To allow staff members to view their assigned duty shifts
4. To generate reports for duty schedules (weekly, monthly, by department)
5. To provide a secure login system for both administrators and staff members
6. To store all data persistently using a cloud database

---

## Main Features

### Administrator Features
- **Dashboard**: View summary statistics and recent schedules
- **Manage Staff**: Add, edit, and remove employee records
- **Create Rota**: Schedule duty shifts for staff members
- **View Schedules**: See all created duty rotas in one place
- **Reports**: Generate and download reports in CSV format
- **Secure Login**: Protected access to admin functions

### Staff Features
- **Dashboard**: View upcoming shifts at a glance
- **My Schedule**: See personal duty schedule with upcoming and past shifts
- **Secure Login**: Protected access to staff portal

---

## User Roles

### Administrator
The administrator is responsible for managing the system. They can:
- Add new employees to the system
- Create duty schedules for staff members
- Edit or delete existing schedules
- Generate reports for management purposes
- View all staff records and schedules

### Staff Member
Staff members can log in to view their assigned duties. They can:
- See their upcoming shifts
- View their complete schedule history
- Access the system from any device with internet

---

## Technologies Used

| Technology | Purpose |
|------------|---------|
| **React** | JavaScript library for building the user interface |
| **TypeScript** | Adds type safety to JavaScript for better code quality |
| **Tailwind CSS** | Utility-first CSS framework for styling |
| **Firebase Firestore** | Cloud database for storing employee, rota, and report data |
| **Firebase Authentication** | Secure user authentication (optional) |
| **Vite** | Fast build tool and development server |
| **React Router** | Handles navigation between pages |
| **Lucide React** | Icon library for user interface icons |

---

## Folder Structure Overview

```
dutyrotaV1/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── guards/          # Route protection components
│   │   └── ui/              # UI component library
│   ├── hooks/               # Custom React hooks for data management
│   │   ├── useAuth.tsx      # Authentication logic
│   │   ├── useEmployees.ts  # Employee data operations
│   │   ├── useRotas.ts      # Rota data operations
│   │   └── useReports.ts    # Report generation logic
│   ├── lib/                 # Utility functions and configurations
│   │   ├── firebase.ts      # Firebase connection setup
│   │   ├── config.ts        # Application settings
│   │   └── ...              # Data layer files
│   ├── pages/               # Page components (screens)
│   └── App.tsx              # Main application file with routes
├── public/                  # Static files
├── .env                     # Environment variables (Firebase keys)
└── package.json             # Project dependencies
```

---

## How the System Works

### Data Flow
1. **User Authentication**: Users log in with their email and password
2. **Role-Based Access**: The system checks if the user is an admin or staff member
3. **Route Protection**: Admin pages are only accessible to administrators
4. **Data Storage**: All data is stored in Firebase Firestore cloud database
5. **Real-Time Updates**: Changes are reflected immediately across the application

### Main Modules

| Module | Description |
|--------|-------------|
| **Authentication** | Handles user login, logout, and session management |
| **Employee Management** | CRUD operations for employee records |
| **Rota Management** | Creating and managing duty schedules |
| **Reports** | Generating downloadable schedule reports |
| **Staff Schedule** | Displaying personalized schedules for staff |

---

## How to Run the System Locally

### Prerequisites
- Node.js version 18 or higher installed on your computer
- A code editor (VS Code recommended)
- A Firebase project (for cloud database)

### Step-by-Step Instructions

1. **Download the project files** to your computer

2. **Open a terminal** in the project folder

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** and go to `http://localhost:8080`

### Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@capemedia.co.ke | admin123 |
| Staff Member | staff@capemedia.co.ke | staff123 |

---

## Firebase Setup Note

The system uses Firebase Firestore as its database. To use the system with real data:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database
3. Copy your Firebase configuration to the `.env` file
4. Set `USE_MOCK_DATA = false` in `src/lib/config.ts`

The system also works in demo mode without Firebase using mock data (default setting).

---

## Main Pages/Modules

### Admin Pages
| Page | URL | Purpose |
|------|-----|---------|
| Admin Login | `/` | Administrator login screen |
| Dashboard | `/admin/dashboard` | Overview and statistics |
| Manage Staff | `/admin/manage-staff` | Employee list with actions |
| Create Employee | `/admin/create-employee` | Add new employee form |
| Create Rota | `/admin/create-rota` | Schedule a duty shift |
| Rota Schedules | `/admin/rota-schedules` | View all schedules |
| Reports | `/admin/reports` | Generate and download reports |

### Staff Pages
| Page | URL | Purpose |
|------|-----|---------|
| Staff Login | `/staff/login` | Staff member login screen |
| Dashboard | `/staff/dashboard` | View upcoming shifts |
| My Schedule | `/staff/schedule` | Full personal schedule |

---

## Future Improvements

If this project were to be developed further, the following features could be added:

1. **Email Notifications**: Send email alerts when new shifts are assigned
2. **Shift Swap Requests**: Allow staff to request shift swaps with colleagues
3. **Calendar Integration**: Export schedules to Google Calendar or Outlook
4. **Mobile App**: Create a dedicated mobile application
5. **Advanced Reporting**: More detailed analytics and charts
6. **Bulk Schedule Import**: Import schedules from Excel files
7. **Staff Leave Management**: Track and manage staff leave requests

---

## Conclusion

The Cape Media Support Staff Duty Rota Management System successfully addresses the need for an efficient scheduling solution. The system provides a user-friendly interface for administrators to manage employees and create duty schedules, while staff members can easily view their assigned shifts.

Key achievements of this project:
- Developed a fully functional web application using modern technologies
- Implemented secure user authentication with role-based access
- Created a clean and responsive user interface
- Integrated cloud database for persistent data storage
- Built reusable components for maintainable code

This project demonstrates practical application of web development concepts including React component architecture, state management, database integration, and responsive design principles.

---

## Acknowledgements

This project was developed as part of the CAPE Information Technology syllabus requirements. Special thanks to the teachers and mentors who provided guidance throughout the development process.

---

*Cape Media Support Staff Duty Rota Management System - CAPE IT School Project*
