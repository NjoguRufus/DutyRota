import { DashboardLayout } from "@/components/DashboardLayout";
import { Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();

  return (
    <DashboardLayout userName={user?.name ?? "Admin"}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">System configuration</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <SettingsIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Settings Coming Soon</h2>
          <p className="text-muted-foreground text-sm">
            This page will contain system settings and configuration options in a future update.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
