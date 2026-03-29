### Missing Pages and Screens

- [x] **Create Employee page** *(Phase 2 complete)*
  - `/admin/create-employee` page created with full form.
  - `/admin/edit-employee/:id` reuses the same component in edit mode.
- [x] **Admin Settings page** *(Phase 1 complete)*
  - `/admin/settings` now has a placeholder Settings page with "Coming Soon" message.
- [x] **Rota Schedules page** *(Phase 3 complete)*
  - `/admin/rota-schedules` page for viewing and managing all rota entries.
- [ ] **Optional landing page**
  - If desired, a separate landing/intro page distinct from admin login at `/`.

---

### Missing or Incomplete UI Sections

- [x] **Create Employee form** *(Phase 2 complete)*
  - Fields: Employee Name, Department, Email, Phone Number.
  - Validation, error messages, and submit handling implemented.
- [x] **Functional employee CRUD controls** *(Phase 2 complete)*
  - Edit button navigates to `/admin/edit-employee/:id`.
  - Delete button shows confirmation modal and removes employee.
- [x] **Functional rota creation behavior** *(Phase 3 complete)*
  - `CreateRota` form now validates and saves to centralized rota state.
  - Employee dropdown synced with centralized employee data.
  - Redirects to `/admin/rota-schedules` after save.
- [x] **Rota edit/delete** *(Phase 3 complete)*
  - Edit via `/admin/edit-rota/:id`.
  - Delete with confirmation modal.
- [x] **Dynamic reports generation** *(Phase 5 complete)*
  - "Generate Report" creates report entries in centralized state.
  - Report name auto-generated based on type and date.
- [x] **Dynamic reports table** *(Phase 5 complete)*
  - Reports table driven by centralized report state.
  - Download generates real CSV file.
  - Delete with confirmation modal.
- [x] **Dynamic staff schedule** *(Phase 4 complete)*
  - `ViewSchedule` now shows shifts for the logged-in staff member.
  - Separates upcoming and past shifts.
- [x] **Empty state handling** *(Phase 3-5 complete)*
  - All tables show empty states when no data exists.

---

### Broken or Weak Flows

- [x] **Staff logout behavior** *(Phase 1 complete)*
  - Staff logout now properly calls `logout()` and redirects to `/staff/login`.
- [x] **Unprotected admin routes** *(Phase 1 complete)*
  - All admin routes are now protected by `AdminGuard`.
- [x] **Unprotected staff schedule route** *(Phase 1 complete)*
  - `/staff/schedule` is now protected by `StaffGuard`.
- [x] **"View All" in Admin Dashboard** *(Phase 3 complete)*
  - Button now navigates to `/admin/rota-schedules`.
- [x] **Settings navigation** *(Phase 1 complete)*
  - `/admin/settings` now renders a dedicated placeholder Settings page.
- [x] **Mixed navigation primitives** *(Phase 1 complete)*
  - Internal navigation now uses React Router `Link` instead of plain `<a href>`.

---

### Missing Components or Abstractions

- [x] **Shared route guards** *(Phase 1 complete)*
  - `AdminGuard` and `StaffGuard` components created in `src/components/guards/`.
- [x] **Shared auth hook or context** *(Firebase Integration complete)*
  - `useAuth` hook and `AuthProvider` context created in `src/hooks/useAuth.tsx`.
- [x] **Centralized employee data store** *(Phase 2 complete)*
  - `src/lib/mockData.ts` - centralized mock data with CRUD functions.
  - `src/hooks/useEmployees.ts` - reactive hook for employee management.
- [x] **Centralized rota data store** *(Phase 3 complete)*
  - `src/lib/rotaData.ts` - centralized rota data with CRUD functions.
  - `src/hooks/useRotas.ts` - reactive hook for rota management.
- [x] **Centralized reports data store** *(Phase 5 complete)*
  - `src/lib/reportData.ts` - centralized report data.
  - `src/hooks/useReports.ts` - reactive hook with CSV generation.
- [ ] **Reusable form components**
  - Could adopt `react-hook-form` + shadcn `Form` for consistent validation.
- [ ] **Reusable table helpers**
  - Optional: components for table empty states, loading states, pagination.

---

### Backend / Firebase Integration

- [x] **Firebase Configuration** *(Complete)*
  - Firebase initialized in `src/lib/firebase.ts`.
  - Environment variables stored in `.env` (gitignored).
- [x] **Firebase Security Rules** *(Complete)*
  - `firestore.rules` with role-based access control.
  - `firestore.indexes.json` for efficient queries.
- [x] **Firebase Authentication** *(Complete)*
  - `login()` and `logout()` functions ready for Firebase Auth.
  - `USE_MOCK_AUTH` toggle in `src/lib/config.ts` to switch modes.
- [x] **Employee CRUD with Firestore** *(Phase 6 complete)*
  - `src/lib/firebaseEmployees.ts` - Firestore CRUD operations.
  - `useEmployees` hook updated to support both mock and Firebase.
- [x] **Rota CRUD with Firestore** *(Phase 6 complete)*
  - `src/lib/firebaseRotas.ts` - Firestore CRUD operations.
  - `useRotas` hook updated to support both mock and Firebase.
- [x] **Reports with Firestore** *(Phase 6 complete)*
  - `src/lib/firebaseReports.ts` - Firestore CRUD operations.
  - `useReports` hook updated to support both mock and Firebase.
- [x] **Central Configuration** *(Phase 6 complete)*
  - `src/lib/config.ts` - Toggle `USE_MOCK_DATA` and `USE_MOCK_AUTH`.
  - Set both to `false` to use real Firebase backend.

---

### Final Polish and Quality Items

- [x] **Update README for this system** *(Phase 7 complete)*
  - Replaced generic boilerplate with comprehensive Cape Media project documentation.
  - Includes features, tech stack, setup instructions, project structure.
- [x] **Remove unused Vite/App.css styles** *(Phase 7 complete)*
  - Deleted `App.css` demo styles (file was not imported).
- [x] **Add 404 navigation polish** *(Phase 1 complete)*
  - 404 "Return to Home" now uses React Router `Link`.
- [x] **Accessibility improvements** *(Phase 7 complete)*
  - Added `htmlFor` and `id` attributes to form labels/inputs.
  - Added `role="alert"` for error messages.
  - Added `aria-label` for icon-only buttons.
  - Added `role="dialog"` and `aria-modal` for confirmation modals.
  - Added `aria-hidden` for decorative icons.
  - Added `autoComplete` attributes for login forms.
- [x] **Loading states** *(Phase 8 complete)*
  - Added loading spinners to AdminDashboard recent schedules.
  - Added loading states to ManageStaff employee table.
  - Added loading states to RotaSchedules table.
  - Added loading states to Reports table.
  - StaffDashboard and ViewSchedule already had loading states.
- [x] **School-project documentation** *(Phase 9 complete)*
  - README.md rewritten in academic/student tone.
  - IMPLEMENTATION_NOTES.md created for presentation preparation.
  - Includes data flow explanations and Q&A for defense.
- [ ] **Add basic tests for key flows** *(Optional)*
  - Could cover: admin login -> dashboard, staff login -> schedule.
- [ ] **Improve responsiveness testing** *(Optional)*
  - Manually verify layouts on small screens.
