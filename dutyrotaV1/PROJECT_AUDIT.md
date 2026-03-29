### 1. Executive summary

**Overall verdict**: The current frontend foundation for the CAPE MEDIA SUPPORT STAFF DUTY ROTA MANAGEMENT SYSTEM is **solid, modern, and reasonably well-structured** for a school project, with clear separation between admin and staff flows, a coherent dashboard layout, and good use of reusable UI primitives. The app already includes most of the required screens at a wireframe / static‑UI level, but **forms, tables, and navigation are still mostly mock/static and not yet wired for real CRUD or backend integration**. A few legacy scaffold artifacts and minor inconsistencies should be cleaned up before serious backend work begins.

The project is **ready to proceed with structured frontend feature implementation and mock state**, but **not yet ready for real backend/database integration** until data‑flow patterns, route guards, and component responsibilities are clarified.

---

### 2. Current project overview

- **Tech stack**
  - **Frontend**: React 18 + TypeScript + Vite (`vite_react_shadcn_ts` template)
  - **Routing**: `react-router-dom` v6
  - **UI system**: Tailwind CSS + shadcn‑ui primitives + custom layout components
  - **State / data**: `@tanstack/react-query` initialized but not used yet
  - **Testing**: Vitest, React Testing Library, Playwright scaffolded but not actively used
  - **Auth**: In‑browser mock auth in `src/lib/auth.ts` using `localStorage`

- **Key app entry points**
  - `src/main.tsx`: Standard Vite React entry, mounts `App` to `#root`.
  - `src/App.tsx`: Sets up `QueryClientProvider`, `TooltipProvider`, toasters, and core `BrowserRouter` with routes.

- **High‑level routing**
  - `/` → `AdminLogin`
  - `/admin/dashboard` → `AdminDashboard`
  - `/admin/manage-staff` → `ManageStaff`
  - `/admin/create-rota` → `CreateRota`
  - `/admin/reports` → `Reports`
  - `/admin/settings` → **reuses `AdminDashboard`** (placeholder)
  - `/staff/login` → `StaffLogin`
  - `/staff/dashboard` → `StaffDashboard`
  - `/staff/schedule` → `ViewSchedule`
  - `*` → `NotFound`

- **Core shared layout**
  - `DashboardLayout` wraps admin pages with `AppSidebar` and `TopNavbar`, using Tailwind+shadcn tokens.
  - Staff pages use their own simple header instead of `DashboardLayout`.

---

### 3. What already works well

- **Clear separation of admin vs staff flows**
  - Dedicated login pages: `AdminLogin.tsx`, `StaffLogin.tsx`.
  - Separate dashboards: `AdminDashboard.tsx`, `StaffDashboard.tsx`.
  - Staff‑only schedule view: `ViewSchedule.tsx`.
  - URL paths and labels closely match your SDS (admin routes under `/admin/...`, staff routes under `/staff/...`).

- **Existing screens aligned with system scope**
  - **Admin login**: Implemented in `AdminLogin.tsx`, with mock auth and error feedback.
  - **Admin dashboard**: Implemented in `AdminDashboard.tsx` using `DashboardLayout`.
  - **Manage staff**: Implemented in `ManageStaff.tsx` with a proper staff table (name, department, email, phone, actions).
  - **Create rota**: Implemented in `CreateRota.tsx` with correct fields: staff name, shift date, shift time, department.
  - **Reports**: Implemented in `Reports.tsx` with report type, date, generate button, and previous reports table.
  - **Staff login / dashboard / schedule**: Implemented across `StaffLogin.tsx`, `StaffDashboard.tsx`, `ViewSchedule.tsx`.

- **Modern, cohesive UI foundation**
  - Consistent Tailwind design tokens via `src/index.css` (background, card, border, accent, success, etc.).
  - Reusable navigation components:
    - `DashboardLayout.tsx` centralizes admin layout (sidebar + top navbar).
    - `AppSidebar.tsx` and `MobileSidebar.tsx` share a common menu definition for responsive nav.
    - `TopNavbar.tsx` consistent global header with search and user avatar.
  - Shadcn UI primitives are imported and available in `src/components/ui`, enabling future consistent CRUD UIs.

- **Mock auth and basic route guarding**
  - `mockLogin`, `getLoggedInUser`, `mockLogout` in `src/lib/auth.ts` provide a simple, side‑effect based mock.
  - `AdminDashboard` and `StaffDashboard` both check `getLoggedInUser()` and redirect if role is wrong or user is missing.
  - Sidebar logout triggers `mockLogout` and navigates to `/`.

---

### 4. What is incomplete

- **Data is entirely static / mock**
  - `AdminDashboard` stats and recent schedules are hardcoded arrays.
  - `ManageStaff` staff list is a hardcoded array with no state or CRUD handlers.
  - `ViewSchedule` schedule entries are hardcoded and not tied to the logged‑in staff user.
  - `Reports` list and generated reports are static.
  - `CreateRota` form does not track input state or submit to any handler (form `onSubmit` just prevents default).

- **Form handling is minimal**
  - Login forms use basic `useState` and `mockLogin` only.
  - Admin/staff forms do not use `react-hook-form` or validation schemas (even though those dependencies exist).
  - No consistent form abstraction or error message components beyond login error banners.

- **Auth and role separation are partial**
  - Route guards exist only on **dashboard** pages, not on other admin routes (`/admin/manage-staff`, `/admin/create-rota`, `/admin/reports`, `/admin/settings`).
  - Staff routes (`/staff/schedule`) are not protected by any explicit guard (only indirectly via navigation from dashboard).
  - No concept of sessions expiring or handling corrupted `auth_user` entries beyond returning `null`.

- **Global styling artifacts from Vite scaffold**
  - `src/App.css` still contains default Vite React styles (logo, spin animation, centered `#root`), which are inconsistent with the tailwind layout actually used.
  - `README.md` describes the Cape Media duty rota system (verify it stays aligned with the product).

---

### 5. What is missing

- **Dedicated “create employee” page / modal**
  - SDS expects a **Create Employee** flow.
  - UI currently only has an `Add Employee` button in `ManageStaff.tsx` with no corresponding form or route, and no navigation target.

- **Optional landing page**
  - No distinct landing/marketing/intro page; `/` is used directly as the admin login.

- **Richer navigation states and breadcrumbs**
  - No breadcrumbs or top‑level section indicators on admin pages besides the page title.
  - Admin settings page is just an alias of `AdminDashboard` (no content).

- **Error states and empty states**
  - Tables (`ManageStaff`, reports, schedules) assume non‑empty data and have no “no data” messaging.
  - Failed auth beyond invalid credentials is not surfaced (e.g., corrupted `localStorage`).

- **Testing and documentation**
  - Test scaffold (`src/test/example.test.ts`, Playwright config) exists but does not cover actual pages or flows.
  - System‑level documentation and SDS mapping are not currently in the repo (this audit will start to fill that gap).

---

### 6. SDS alignment review

**Admin side should include**

- **Login**  
  - Implemented as `AdminLogin.tsx`, route `/`.  
  - Fields: email, password (meets expectations).

- **Dashboard**  
  - Implemented as `AdminDashboard.tsx`, route `/admin/dashboard`.  
  - Shows stats cards (manage staff, create rota, reports, total staff) and a recent schedules table.  
  - Aligns conceptually with a high‑level overview; data is mock only.

- **Manage staff**  
  - Implemented as `ManageStaff.tsx`, route `/admin/manage-staff`.  
  - **Staff table** columns: Employee Name, Department, Email, Phone, Actions.  
  - This matches the SDS requirement very closely.

- **Create employee**  
  - **Missing as a dedicated screen/form.**  
  - `ManageStaff` has an "Add Employee" button with no handler; no `/admin/create-employee` or modal exists.

- **Create rota**  
  - Implemented as `CreateRota.tsx`, route `/admin/create-rota`.  
  - **Rota form fields present**:
    - Staff Name (select)
    - Shift Date (date input)
    - Shift Time (select)
    - Department (select)  
  - Aligns closely with SDS rota form requirement.

- **Reports**  
  - Implemented as `Reports.tsx`, route `/admin/reports`.  
  - **Reports form fields present**:
    - Report Type (select)
    - Date (date input)
    - Generate Report button
  - **Reports table present**:
    - Columns: Report Name, Date, Action (Download).  
  - Matches SDS expectations for reports UI, though functionality is mock.

- **Logout**  
  - Implemented in:
    - `AppSidebar.tsx` and `MobileSidebar.tsx` as a Logout button calling `mockLogout()` and `navigate("/")` (admin layout).
  - There is **no explicit admin logout on the top navbar**; sidebar/mobile handle it.

**Staff side should include**

- **Login**  
  - Implemented as `StaffLogin.tsx`, route `/staff/login`.  
  - Fields: email, password; uses `mockLogin` and navigates to `/staff/dashboard` for staff role.

- **Dashboard**  
  - Implemented as `StaffDashboard.tsx`, route `/staff/dashboard`.  
  - Provides a welcome card and a primary “View My Schedule” call‑to‑action.

- **View schedule**  
  - Implemented as `ViewSchedule.tsx`, route `/staff/schedule`.  
  - **Schedule table fields present**:
    - Date
    - Shift Time
    - Department  
  - The schedule is currently hardcoded and not filtered by the logged‑in user.

- **Logout**  
  - Staff pages use a **Logout link** (`<a href="/staff/login">Logout</a>`) in `StaffDashboard` and `ViewSchedule` headers.
  - This **does not clear mock auth state** (no call to `mockLogout()`), so SDS “logout” behavior is only partially met on staff side.

---

### 7. UI / page‑by‑page audit

#### 7.1 AdminLogin (`src/pages/AdminLogin.tsx`)

- **Coverage**
  - Implements admin login page with branding header, email/password form, error messaging, and link to staff login.
- **Good**
  - Clear visual separation (card with title “Admin Login”).
  - Basic validation through HTML `required` attributes.
  - Informative cross‑link: “Staff member? Login here.”
- **Needs improvement**
  - No remember‑me, forgot‑password, or password visibility toggle (acceptable for school project, but could be optional polish).
  - Uses `a href` for staff login instead of `Link`/`NavLink` from React Router.

#### 7.2 StaffLogin (`src/pages/StaffLogin.tsx`)

- **Coverage**
  - Symmetrical to AdminLogin with "Staff Login" title and link back to admin login (`/`).
- **Good**
  - Consistent branding and layout as AdminLogin.
  - Shares same success/error patterns.
- **Needs improvement**
  - Same routing concern: uses raw `a href` rather than client‑side navigation component.

#### 7.3 AdminDashboard (`src/pages/AdminDashboard.tsx`)

- **Coverage**
  - Uses `DashboardLayout` with `userName` derived from `getLoggedInUser()`.
  - Stats cards linking to Manage Staff, Create Rota, Reports, and total staff count.
  - Recent schedules table with columns: Date, Staff Name, Shift Time, Department.
- **Good**
  - Layout is responsive with a grid of stat cards.
  - Quick create button leads to `/admin/create-rota`.
  - Makes use of mock auth for role checking and redirect to `/` if user not admin.
- **Needs improvement**
  - All numbers and schedules are hardcoded; not wired to any real state.
  - “View All” button has no navigation or handler.
  - Reported `user` is read from localStorage directly per render; no context/hook yet.

#### 7.4 ManageStaff (`src/pages/ManageStaff.tsx`)

- **Coverage**
  - Staff table with columns exactly matching SDS: Employee Name, Department, Email, Phone, Actions.
  - Action icons for edit and delete.
- **Good**
  - Good table structure for dynamic data later.
  - Responsive columns (email hidden on small screens, phone hidden on medium).
  - Visual hierarchy and spacing are clean.
- **Needs improvement**
  - `Add Employee` button has no click handler, route, or modal; **Create Employee** flow is missing.
  - Edit/Delete buttons are present but not wired up.
  - No empty state or pagination/filtering.
  - No route guard to restrict access to admins only.

#### 7.5 CreateRota (`src/pages/CreateRota.tsx`)

- **Coverage**
  - Form fields:
    - Staff Name (select)
    - Shift Date (date)
    - Shift Time (select)
    - Department (select)
- **Good**
  - Fields align with SDS rota form requirements.
  - Layout is clean and minimal; uses `DashboardLayout`.
- **Needs improvement**
  - `onSubmit` only calls `e.preventDefault()`; no local state or integration with any data store.
  - Staff list options are hardcoded and duplicated logically with other parts of the app.
  - No inline form validation or feedback messages.

#### 7.6 Reports (`src/pages/Reports.tsx`)

- **Coverage**
  - Generate Report section:
    - Report Type (select)
    - Date (input type=date)
    - Generate Report button
  - Previous Reports table:
    - Report Name, Date, Action (Download)
- **Good**
  - Closely matches SDS expectations for report page fields.
  - Clear clustering of “Generate Report” vs “Previous Reports” sections.
- **Needs improvement**
  - No actual logic behind "Generate Report" or "Download".
  - Reports data is static.
  - No way to filter, search, or paginate reports yet.

#### 7.7 StaffDashboard (`src/pages/StaffDashboard.tsx`)

- **Coverage**
  - Simple header, welcome card, and button to “View My Schedule”.
  - Role check redirects non‑staff to `/staff/login`.
- **Good**
  - Clear entry point for staff to access their schedule.
  - Visual distinction from admin dashboard (no sidebar, more centered card layout).
- **Needs improvement**
  - Logout link just navigates to `/staff/login` and does not clear `localStorage`.
  - No quick summary of upcoming shifts in the dashboard itself.

#### 7.8 ViewSchedule (`src/pages/ViewSchedule.tsx`)

- **Coverage**
  - Header, back button to staff dashboard, and schedule table.
  - Table columns: Date, Shift Time, Department.
- **Good**
  - Schedule table structure perfectly matches SDS schedule table requirement.
  - Clear “Back to Dashboard” affordance.
- **Needs improvement**
  - Schedules are static and not derived from any state backend or rota definitions.
  - No role/route guard; any user can hit `/staff/schedule` directly.
  - The subtitle text is hardcoded to “Upcoming duty shifts for Anne Njoroge”.

#### 7.9 NotFound (`src/pages/NotFound.tsx`)

- **Coverage**
  - Simple 404 page with back‑to‑home link.
- **Good**
  - Logs 404 errors to console with attempted path for debugging.
  - Behavior is acceptable for this project’s scope.
- **Needs improvement**
  - Uses raw `a href="/"` instead of SPA navigation component.

---

### 8. Navigation / user flow audit

- **Routing structure**
  - `App.tsx` uses `BrowserRouter` with straightforward route definitions; no nested routes or layout routes.
  - Admin pages all use `DashboardLayout`, but this is wired inside the pages themselves rather than via nested routing.
  - Staff pages are standalone and not wrapped by `DashboardLayout`.

- **Admin flow**
  - **Intended**: `/` (AdminLogin) → `/admin/dashboard` → navigate to manage staff / create rota / reports / settings via sidebar or dashboard cards.
  - **Actual**
    - This flow works visually and from a navigation perspective.
    - However, `/admin/manage-staff`, `/admin/create-rota`, `/admin/reports`, `/admin/settings` are not protected by explicit role checks.

- **Staff flow**
  - **Intended**: `/staff/login` → `/staff/dashboard` → `/staff/schedule`.
  - **Actual**
    - This flow works via `navigate` from login and from the dashboard button.
    - `/staff/dashboard` has a role guard; `/staff/schedule` does not (it can be directly accessed).

- **Sidebar / top nav**
  - `AppSidebar` and `MobileSidebar` reflect admin navigation consistently:
    - Dashboard, Manage Staff, Create Rota, Reports, Settings, Logout.
  - `TopNavbar` provides search and notifications, but no navigation actions.

- **Dead links / inconsistencies**
  - `AdminDashboard` “View All” is visually clickable but has no actual navigation.
  - `Settings` in `AppSidebar` points to `/admin/settings` which currently reuses `AdminDashboard` (no settings UI yet).
  - Several links use `<a href>` rather than React Router’s `Link`/`NavLink`, causing full page reloads and potentially bypassing in‑app state.

---

### 9. Component readiness audit

- **Forms**
  - Login forms: controlled with `useState` and call `mockLogin`; ready to be migrated into `react-hook-form` if desired.
  - Admin forms (Create Rota, Reports): HTML‑level forms with no controlled state or validation.
  - No common form components from `src/components/ui/form.tsx` or `react-hook-form` yet, but the primitives exist and can be adopted.

- **Tables**
  - `ManageStaff`, `AdminDashboard` (recent schedules), `Reports`, and `ViewSchedule` all use simple semantic `<table>` markup with `<thead>/<tbody>`.
  - Structures are **ready to accept dynamic data** via state or props, with minimal refactor.

- **Layouts and reusability**
  - `DashboardLayout` cleanly separates layout from content; admin pages pass their content as `children`.
  - `AppSidebar` and `MobileSidebar` reuse the same `menuItems` definition (good DRY approach).
  - `NavLink` wrapper in `src/components/NavLink.tsx` is ready for consistent navigation styling.

- **Role‑based rendering readiness**
  - Mock auth already stores `role` and `name`, which is enough to:
    - Condition navigation items.
    - Protect routes.
    - Conditionally render components based on role.
  - As currently written, logic resides in individual pages rather than shared route guards, but it is not hard to refactor.

- **Backend integration readiness**
  - The presence of React Query (`QueryClientProvider` in `App.tsx`) is good preparation for API integration.
  - However, no hooks or patterns for data fetching/mutation are defined yet (e.g., `useStaff`, `useRota`, etc.).
  - All data is static; wiring to backend will require introducing a data layer and replacing hardcoded arrays.

---

### 10. UX / design audit

- **Consistency**
  - Colors and typography are consistent due to Tailwind and `index.css` design tokens.
  - Admin pages share a common layout (sidebar + top nav + content area).
  - Staff pages share a simplified layout and brand header.

- **Spacing and readability**
  - Generous padding in cards and tables (`p-5`, `p-6`, etc.) makes content easy to scan.
  - Typography sizing is appropriate for dashboards and tables (`text-sm`, `text-2xl` for headings).
  - Table rows use hover highlight states (`hover:bg-accent/50`), aiding scanability.

- **Responsiveness**
  - Sidebar hidden on mobile and replaced by `MobileSidebar`.
  - Tables hide less critical columns on smaller viewports (e.g., email/phone in `ManageStaff`).
  - Inputs and forms appear mobile‑friendly but have not been fully tested across breakpoints.

- **Color usage and clarity**
  - Clear primary/secondary/success/destructive palettes defined in CSS variables.
  - Buttons and cards use those palette tokens effectively (e.g., primary for primary actions, destructive for logout hover).

- **Dashboard feel**
  - Admin dashboard already feels like a simple overview page with stats and recent schedules.
  - Staff dashboard is intentionally simpler, which is appropriate.

- **Visual distinction between admin and staff dashboards**
  - Admin: has sidebar, top nav, and denser layout with multiple widgets.
  - Staff: minimal layout with central card and simple header.
  - This distinction is **good** and aligns with different user personas.

- **Areas to refine later**
  - Remove unused Vite default `App.css` styling to avoid confusion.
  - Add small UX details like:
    - Disabled states on buttons when actions are not available.
    - Toast notifications for actions such as rota creation, employee creation, or report generation.
    - Empty state illustration/text for tables when there is no data.

---

### 11. Technical debt list

- **Legacy scaffold artifacts**
  - `src/App.css` still contains Vite demo styles and may conflict with layout assumptions.
  - `README.md` should remain aligned with the Cape Media duty rota product as features evolve.

- **Auth and routing**
  - Route guards are implemented ad‑hoc in pages (`useEffect` checks) rather than centralized.
  - Staff logout links do not clear auth state.
  - `Settings` route is a placeholder reusing `AdminDashboard`.

- **Static data and duplication**
  - Staff names appear in multiple places (ManageStaff, CreateRota, Dashboard recent schedules, ViewSchedule, auth mock) with no single source of truth.
  - Schedules, staff lists, and reports are all hardcoded.

- **Inconsistent navigation primitives**
  - Some navigation uses `NavLink`/React Router, others use plain `<a href>` causing full reloads.

- **Low test coverage**
  - No meaningful tests for critical flows such as login, dashboard routing, or schedule viewing.

---

### 12. High‑priority issues

1. **Missing dedicated Create Employee flow** (no page or modal, Add Employee button is inert).
2. **Incomplete and inconsistent logout behavior**, especially for staff (does not clear mock auth).
3. **Lack of route guards on non‑dashboard admin pages** (`/admin/manage-staff`, `/admin/create-rota`, `/admin/reports`, `/admin/settings`).
4. **Static and duplicated mock data** across staff, schedules, and reports, increasing future refactor cost.
5. **Inconsistent navigation (`a href` vs `Link/NavLink`) and placeholder `Settings` route** that may confuse users later.

---

### 13. Recommended build order (pre‑backend)

1. **Stabilize routing and auth behavior**
   - Introduce a simple, shared route‑guard pattern for admin and staff.
   - Fix logout everywhere to always clear `auth_user`.
   - Replace `a href` with React Router `Link/NavLink` where appropriate.

2. **Implement Create Employee UI**
   - Decide if it is a **dedicated page** (e.g., `/admin/create-employee`) or a modal on `ManageStaff`.
   - Implement the required employee form fields and wire them to local or mock state.

3. **Introduce a front‑end data model (mock state)**
   - Centralize mock entities (employees, rotas, schedules, reports) in a single module or React Query mock hooks.
   - Make tables and forms consume this central mock data.

4. **Enhance reports and schedule flows**
   - Make "Generate Report" and "Download" trigger fake async operations (using React Query) to prepare for a real backend.
   - Ensure staff schedule view is based on the logged‑in staff user.

5. **Clean up technical debt**
   - Remove unused `App.css` styles and update `README.md` to describe this project.
   - Add minimal tests for login flows and route protection.

---

### 14. Final verdict on backend integration readiness

- **Current status**:  
  - The **UI skeleton and layout architecture are sound** and aligned with your SDS.  
  - **Data and behavior are still mostly static/mock** with ad‑hoc guards and duplicated data.

- **Verdict**:  
  - The project is **not yet ready for real backend/database integration**.  
  - Before integrating APIs or a database, you should:
    - Stabilize routing and auth patterns.
    - Implement a clear mock data‑flow layer (or React Query hooks) to decouple UI from backend.
    - Add the missing Create Employee UI and fix logout/guards so flows are correct in the front end alone.

Once these frontend patterns are in place, adding a backend (REST or GraphQL) will be much smoother, with minimal UI rewrites.

