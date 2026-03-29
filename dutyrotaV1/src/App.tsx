import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { UserPreferencesProvider } from "@/hooks/useUserPreferences";
import { AdminGuard, StaffGuard } from "@/components/guards";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ManageStaff from "./pages/ManageStaff";
import RotaSchedules from "./pages/RotaSchedules";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import ViewSchedule from "./pages/ViewSchedule";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RedirectManageStaffEdit() {
  const { id } = useParams();
  const q = id ? `?edit=${encodeURIComponent(id)}` : "";
  return <Navigate to={`/admin/manage-staff${q}`} replace />;
}

function RedirectRotaSchedulesEdit() {
  const { id } = useParams();
  const q = id ? `?editRota=${encodeURIComponent(id)}` : "";
  return <Navigate to={`/admin/rota-schedules${q}`} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserPreferencesProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AdminLogin />} />

              <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path="/admin/manage-staff" element={<AdminGuard><ManageStaff /></AdminGuard>} />
              <Route path="/admin/rota-schedules" element={<AdminGuard><RotaSchedules /></AdminGuard>} />
              <Route path="/admin/reports" element={<AdminGuard><Reports /></AdminGuard>} />
              <Route path="/admin/settings" element={<AdminGuard><Settings /></AdminGuard>} />

              <Route
                path="/admin/create-rota"
                element={<AdminGuard><Navigate to="/admin/rota-schedules" replace state={{ openCreateRota: true }} /></AdminGuard>}
              />
              <Route
                path="/admin/edit-rota/:id"
                element={<AdminGuard><RedirectRotaSchedulesEdit /></AdminGuard>}
              />
              <Route
                path="/admin/create-staff"
                element={<AdminGuard><Navigate to="/admin/manage-staff" replace state={{ openAddStaff: true }} /></AdminGuard>}
              />
              <Route
                path="/admin/edit-staff/:id"
                element={<AdminGuard><RedirectManageStaffEdit /></AdminGuard>}
              />
              <Route
                path="/admin/create-employee"
                element={<AdminGuard><Navigate to="/admin/manage-staff" replace state={{ openAddStaff: true }} /></AdminGuard>}
              />
              <Route
                path="/admin/edit-employee/:id"
                element={<AdminGuard><RedirectManageStaffEdit /></AdminGuard>}
              />

              <Route path="/staff/login" element={<StaffLogin />} />
              <Route path="/staff/dashboard" element={<StaffGuard><StaffDashboard /></StaffGuard>} />
              <Route path="/staff/schedule" element={<StaffGuard><ViewSchedule /></StaffGuard>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </UserPreferencesProvider>
  </QueryClientProvider>
);

export default App;
