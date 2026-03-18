import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminGuard, StaffGuard } from "@/components/guards";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ManageStaff from "./pages/ManageStaff";
import CreateEmployee from "./pages/CreateEmployee";
import CreateRota from "./pages/CreateRota";
import RotaSchedules from "./pages/RotaSchedules";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import ViewSchedule from "./pages/ViewSchedule";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* "/" serves as the admin login ffefewpage (no separate landing page for now) */}
            <Route path="/" element={<AdminLogin />} />

            {/* Admin routes - protected by AdminGuard */}
            <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/manage-staff" element={<AdminGuard><ManageStaff /></AdminGuard>} />
            <Route path="/admin/create-employee" element={<AdminGuard><CreateEmployee /></AdminGuard>} />
            <Route path="/admin/edit-employee/:id" element={<AdminGuard><CreateEmployee /></AdminGuard>} />
            <Route path="/admin/create-rota" element={<AdminGuard><CreateRota /></AdminGuard>} />
            <Route path="/admin/edit-rota/:id" element={<AdminGuard><CreateRota /></AdminGuard>} />
            <Route path="/admin/rota-schedules" element={<AdminGuard><RotaSchedules /></AdminGuard>} />
            <Route path="/admin/reports" element={<AdminGuard><Reports /></AdminGuard>} />
            <Route path="/admin/settings" element={<AdminGuard><Settings /></AdminGuard>} />

            {/* Staff routes - protected by StaffGuard */}
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/dashboard" element={<StaffGuard><StaffDashboard /></StaffGuard>} />
            <Route path="/staff/schedule" element={<StaffGuard><ViewSchedule /></StaffGuard>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
