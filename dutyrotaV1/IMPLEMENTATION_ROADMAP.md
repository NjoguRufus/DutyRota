### Phase 1: Stabilize structure and navigation

- **Goal**
  - Ensure routing, auth checks, and navigation are consistent and accurate for both admin and staff, without yet adding real backend logic.

- **Key tasks**
  - **T1.1**: Centralize route guards for admin and staff:
    - Create simple helper(s) (e.g., `requireAdmin`, `requireStaff`, or wrapper components) using `getLoggedInUser()` to enforce:
      - Admin‑only access to `/admin/dashboard`, `/admin/manage-staff`, `/admin/create-rota`, `/admin/reports`, `/admin/settings`.
      - Staff‑only access to `/staff/dashboard`, `/staff/schedule`.
  - **T1.2**: Normalize logout behavior:
    - Ensure all logout actions (admin sidebar, mobile sidebar, staff header links) call `mockLogout()` and redirect correctly.
  - **T1.3**: Standardize navigation primitives:
    - Replace `<a href="...">` links that navigate within the app (e.g., in login pages, 404, staff headers) with React Router `Link`/`NavLink`.
  - **T1.4**: Decide on `/` behavior:
    - Confirm that `/` should be the admin login (current behavior) vs. a landing page; document this decision in a short comment or docs.

- **Dependencies**
  - Existing `mockLogin`, `mockLogout`, `getLoggedInUser` in `src/lib/auth.ts`.

- **Estimated complexity**
  - **Low to medium**: Mostly wiring and minor refactor, but touches several pages.

- **Notes / risks**
  - Keep guard logic lightweight (no heavy abstraction) to avoid over‑engineering.
  - Be careful to avoid redirect loops (e.g., redirecting staff to `/staff/login` when already there).

---

### Phase 2: Frontend interactivity and mock state

- **Goal**
  - Introduce a clean front‑end data model using mock data and local state (or React Query with in‑memory data) so UI components behave realistically before connecting to a real backend.

- **Key tasks**
  - **T2.1**: Centralize mock data:
    - Create a module (e.g., `src/mock/data.ts` or `src/lib/mockData.ts`) to hold:
      - Employees list (matching SDS staff table).
      - Rota entries (staff, date, time, department).
      - Reports metadata.
  - **T2.2**: Introduce simple data hooks:
    - Option A (simpler): Custom hooks using `useState`/`useEffect` per feature: `useEmployees`, `useRotas`, `useReports`.
    - Option B (future‑proof): Use `react-query` with a fake in‑memory API layer.
  - **T2.3**: Wire tables to mock data:
    - `ManageStaff`: consume centralized employee data for table rows.
    - `AdminDashboard` recent schedules: derive from rota data.
    - `ViewSchedule`: filter rota data for the logged‑in staff member.
    - `Reports`: generate “Previous Reports” from mock data.

- **Dependencies**
  - Phase 1 guards and navigation aligned so user flows are stable.

- **Estimated complexity**
  - **Medium**: Requires choosing a state pattern and touching most feature pages.

- **Notes / risks**
  - Decide early whether you want to fully embrace React Query or use simpler local state so you do not rewrite later.
  - For a school project, a hybrid approach is fine: simple hooks now, React Query later for API.

---

### Phase 3: Employee CRUD

- **Goal**
  - Implement full create/read/update/delete behavior for employees on the admin side, backed by mock front‑end state.

- **Key tasks**
  - **T3.1**: Design the Create Employee UI:
    - Decide whether `Add Employee` opens:
      - A dedicated page (e.g., `/admin/create-employee`), or
      - A modal/sheet within `ManageStaff`.
    - Ensure the form includes SDS fields:
      - Employee Name, Department, Email, Phone Number.
  - **T3.2**: Implement employee form:
    - Use `react-hook-form` and optional `zod` schema for validation.
    - Show inline validation errors and success toasts.
  - **T3.3**: Wire employee list to create/update/delete:
    - On successful create, add new employee to mock state and refresh `ManageStaff` table.
    - Implement Edit flow (open form pre‑filled with selected employee).
    - Implement Delete flow (confirmation + removal from mock state).
  - **T3.4**: Surface employee data in other views:
    - Use the unified employee list to populate dropdowns in `CreateRota`.

- **Dependencies**
  - Phase 2’s centralized mock data and data hooks.

- **Estimated complexity**
  - **Medium**: CRUD logic, validation, and potential modals.

- **Notes / risks**
  - Keep UI interactions simple but robust; avoid building a full design system—leverage shadcn components already present.
  - Ensure no duplicated employee logic in multiple files.

---

### Phase 4: Rota CRUD

- **Goal**
  - Implement create and (optionally) update/delete for rota entries, making the rota form functional and reflecting changes across admin dashboard and staff schedule views.

- **Key tasks**
  - **T4.1**: Wire `CreateRota` form to mock state:
    - Use `react-hook-form` with fields:
      - Staff Name, Shift Date, Shift Time, Department.
    - On submit, add a new rota record to mock data.
  - **T4.2**: Make rota data visible:
    - Admin Dashboard’s “Recent Schedules” table should show latest rota entries.
    - Staff `ViewSchedule` should filter rota entries by logged‑in user and display upcoming shifts.
  - **T4.3**: Consider basic rota management:
    - Optional: Add rota list/table for admins (could be part of Manage Staff or a new page).
    - Provide a way to cancel or edit an existing rota (even if minimal).

- **Dependencies**
  - Employee CRUD completed so Rota form can use real employee options (Phase 3).
  - Mock state hooks from Phase 2.

- **Estimated complexity**
  - **Medium**: Linkage between admin and staff views plus date/time handling.

- **Notes / risks**
  - Be careful with date formatting and storage; standardize on ISO strings internally, formatted for display.
  - For a school project, a simple “no overlap” check or absence of conflict detection is acceptable but could be a stretch goal.

---

### Phase 5: Reports

- **Goal**
  - Make the Reports page functional with generated data based on existing rota and employee information, still using front‑end logic only.

- **Key tasks**
  - **T5.1**: Implement “Generate Report” flow:
    - On button click, compute report data from rota and employees:
      - Weekly Rota Report, Monthly Staff Summary, Department Coverage.
    - Add generated report metadata into the mock “Previous Reports” list.
  - **T5.2**: Implement “Download” (placeholder) behavior:
    - For now, simulate download by:
      - Generating a CSV or JSON blob on the client, or
      - Displaying a modal with a summary.
  - **T5.3**: Add filtering and sorting as needed:
    - Basic sorting by date or type to make the table easier to navigate.

- **Dependencies**
  - Full rota and employee data model from Phases 3–4.

- **Estimated complexity**
  - **Medium**: Purely front‑end computation and UI wiring.

- **Notes / risks**
  - Keep report formats simple and well‑documented since they will inform backend API contracts later.

---

### Phase 6: Auth and role-based logic hardening

- **Goal**
  - Refine the current mock auth into a structure that closely mirrors real authentication, making it straightforward to plug in real backend auth later.

- **Key tasks**
  - **T6.1**: Introduce an Auth context or hook:
    - Provide `useAuth()` with `user`, `login`, `logout`, and `isAdmin`/`isStaff`.
  - **T6.2**: Update route guards to use the new context:
    - Replace direct `getLoggedInUser()` calls with context.
  - **T6.3**: Improve logout UX:
    - Redirect users to appropriate login screens.
    - Optionally show a “You have been logged out” toast.
  - **T6.4**: Prepare for token/session based auth:
    - Abstract storage mechanism (still localStorage, but via a small service).

- **Dependencies**
  - Phase 1 initial guards; Phases 2–5 data flows stable.

- **Estimated complexity**
  - **Medium**: Some architectural refactor but still contained within frontend.

- **Notes / risks**
  - Avoid premature complexity (e.g., do not implement full OAuth flows; just structure the code).

---

### Phase 7: Backend/database integration

- **Goal**
  - Replace mock data and operations with real API calls and a persistent database, without significantly altering the UI or UX.

- **Key tasks**
  - **T7.1**: Define API contracts:
    - Endpoints for:
      - Auth (login/logout).
      - Employees CRUD.
      - Rota CRUD.
      - Reports generation/listing.
    - Ensure these mirror the shapes already used in mock hooks.
  - **T7.2**: Implement data layer:
    - Replace mock hooks with React Query hooks that call real endpoints.
    - Handle loading and error states using `sonner` and `Toaster` components already included.
  - **T7.3**: Integrate real auth:
    - Swap `mockLogin`/`mockLogout` with real API calls and token/session handling.
    - Update guards to rely on real auth data.
  - **T7.4**: Data migration / seeding:
    - Seed demo data to keep the school project demoable.

- **Dependencies**
  - All prior phases; stable UI and mock behavior in place.

- **Estimated complexity**
  - **High**: Involves another codebase (backend) and careful testing of integration points.

- **Notes / risks**
  - Keep backend APIs as close as possible to the mock interfaces to minimize frontend changes.
  - Plan for partial offline/optimistic behavior only if time allows; otherwise, keep flows simple.

---

### Phase 8: Polish, responsiveness, and documentation

- **Goal**
  - Refine UX, fix edge cases, and document the system so it is presentation‑ready as a school project.

- **Key tasks**
  - **T8.1**: UX polish:
    - Add empty states for all tables (no employees, no rotas, no reports).
    - Add loading states (spinners or skeletons) for data‑fetching views.
    - Improve small‑screen layouts and test on mobile widths.
  - **T8.2**: Visual refinements:
    - Remove any remaining scaffolded styles (e.g., unused `App.css` rules).
    - Tweak spacing/typography where needed for consistency.
  - **T8.3**: Documentation:
    - Replace the boilerplate `README.md` with a project‑specific description:
      - System overview, roles, main features.
      - How to run the project.
      - Brief explanation of architecture.
    - Link to `PROJECT_AUDIT.md`, `IMPLEMENTATION_ROADMAP.md`, and `MISSING_FEATURES_CHECKLIST.md`.
  - **T8.4**: Basic testing:
    - Add a few high‑value tests: login, route protection, schedule visibility.

- **Dependencies**
  - Earlier phases largely complete; polish can be parallelized with backend work if needed.

- **Estimated complexity**
  - **Low to medium**: Many small tasks; time‑boxed polish rather than deep refactors.

- **Notes / risks**
  - It is easy to over‑polish; prioritize items that improve clarity and reduce bugs for demo scenarios.

