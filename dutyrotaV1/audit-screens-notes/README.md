### Audit screen notes

Concise pointers to important files/components/pages that need attention based on the initial audit.

**Phase 1 Status**: COMPLETE - Route guards, logout behavior, and navigation standardized.
**Phase 2 Status**: COMPLETE - Employee CRUD with centralized mock state.
**Phase 3 Status**: COMPLETE - Rota CRUD with centralized mock state.
**Phase 4 Status**: COMPLETE - Staff schedule flow with dynamic data.
**Phase 5 Status**: COMPLETE - Reports generation with CSV download.
**Phase 6 Status**: COMPLETE - Firebase integration (Firestore services for all data types).
**Phase 7 Status**: COMPLETE - Final polish (README, accessibility, cleanup).
**Phase 8 Status**: COMPLETE - Loading states added to all data tables.
**Phase 9 Status**: COMPLETE - School-project documentation (academic README, IMPLEMENTATION_NOTES.md).

---

### Configuration

- `src/lib/config.ts`: Central toggle for mock vs Firebase mode.
  - `USE_MOCK_DATA`: Set to `false` to use Firestore.
  - `USE_MOCK_AUTH`: Set to `false` to use Firebase Authentication.

---

### Route Guards

- `src/components/guards/AdminGuard.tsx`: Protects admin routes, redirects non-admins.
- `src/components/guards/StaffGuard.tsx`: Protects staff routes, redirects non-staff.
- `src/components/guards/index.ts`: Barrel export for guards.

---

### Routing and entry

- `src/App.tsx`: Central place defining all routes for admin and staff.
  - All admin routes wrapped with `AdminGuard`, staff routes with `StaffGuard`.
  - Routes: `/admin/create-employee`, `/admin/edit-employee/:id`, `/admin/rota-schedules`, `/admin/edit-rota/:id`.

---

### Auth and role handling

- `src/lib/auth.ts`: Authentication functions (mock and Firebase).
- `src/hooks/useAuth.tsx`: Auth context and hook with `AuthProvider`.
  - Supports both mock and Firebase auth via config toggle.

---

### Data Layers

**Mock Data (Development)**:
- `src/lib/mockData.ts`: In-memory employee store.
- `src/lib/rotaData.ts`: In-memory rota store.
- `src/lib/reportData.ts`: In-memory report store.

**Firebase Data (Production)**:
- `src/lib/firebaseEmployees.ts`: Firestore CRUD for employees.
- `src/lib/firebaseRotas.ts`: Firestore CRUD for rotas.
- `src/lib/firebaseReports.ts`: Firestore CRUD for reports.

**Reactive Hooks** (auto-switch based on config):
- `src/hooks/useEmployees.ts`: Employee data and actions.
- `src/hooks/useRotas.ts`: Rota data and actions.
- `src/hooks/useReports.ts`: Report data and actions with CSV download.

---

### Admin pages

- `src/pages/AdminLogin.tsx`: Admin login at `/`.
- `src/pages/AdminDashboard.tsx`: Dashboard with dynamic stats and recent schedules.
- `src/pages/ManageStaff.tsx`: Employee table with edit/delete actions.
- `src/pages/CreateEmployee.tsx`: Create/edit employee form at `/admin/create-employee` and `/admin/edit-employee/:id`.
- `src/pages/CreateRota.tsx`: Create/edit rota form at `/admin/create-rota` and `/admin/edit-rota/:id`.
- `src/pages/RotaSchedules.tsx`: Rota table with edit/delete at `/admin/rota-schedules`.
- `src/pages/Reports.tsx`: Report generation and download at `/admin/reports`.
- `src/pages/Settings.tsx`: Placeholder at `/admin/settings`.

---

### Staff pages

- `src/pages/StaffLogin.tsx`: Staff login at `/staff/login`.
- `src/pages/StaffDashboard.tsx`: Dashboard with upcoming shifts summary.
- `src/pages/ViewSchedule.tsx`: Staff schedule with upcoming and past shifts.

---

### 404 page

- `src/pages/NotFound.tsx`: 404 page with "Return to Home" link.

---

### Admin layout and navigation

- `src/components/DashboardLayout.tsx`: Wraps admin pages with sidebar + top nav.
- `src/components/AppSidebar.tsx`: Desktop sidebar with admin menu and Logout.
- `src/components/MobileSidebar.tsx`: Mobile slide-in menu.
- `src/components/TopNavbar.tsx`: Top navbar with search and user avatar.

---

### Firebase Configuration

- `firebase.json`: Firebase project config.
- `firestore.rules`: Security rules with role-based access.
- `firestore.indexes.json`: Composite indexes for queries.
- `.env`: Firebase API keys (gitignored).
- `.env.example`: Template for .env file.

---

### Completed in Phase 7

- [x] Updated README.md with project documentation.
- [x] Deleted unused `App.css` styles.
- [x] Accessibility improvements (aria-labels, roles, form labels).

### Completed in Phase 8

- [x] Loading states for AdminDashboard recent schedules.
- [x] Loading states for ManageStaff employee table.
- [x] Loading states for RotaSchedules table.
- [x] Loading states for Reports table.

### Completed in Phase 9

- [x] README.md rewritten in academic/student tone.
- [x] IMPLEMENTATION_NOTES.md created for presentation preparation.
- [x] Firestore structure documentation.
- [x] Q&A section for defense preparation.

### Optional Remaining Items

- [ ] Add basic tests for key flows (optional).
- [ ] Manual responsiveness testing on small screens (optional).
