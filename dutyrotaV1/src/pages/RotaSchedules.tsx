import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, AlertTriangle, CalendarDays, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRotas } from "@/hooks/useRotas";
import { formatDate, getShiftTimeDisplay } from "@/lib/rotaData";
import { toast } from "sonner";

export default function RotaSchedules() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rotas, removeRota, loading } = useRotas();

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    rotaId: string | null;
    staffName: string;
    shiftDate: string;
  }>({
    open: false,
    rotaId: null,
    staffName: "",
    shiftDate: "",
  });

  const handleAddSchedule = () => {
    navigate("/admin/create-rota");
  };

  const handleEditSchedule = (id: string) => {
    navigate(`/admin/edit-rota/${id}`);
  };

  const handleDeleteClick = (id: string, staffName: string, shiftDate: string) => {
    setDeleteModal({
      open: true,
      rotaId: id,
      staffName,
      shiftDate: formatDate(shiftDate),
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.rotaId) return;

    const success = await removeRota(deleteModal.rotaId);
    if (success) {
      toast.success("Schedule deleted successfully");
    } else {
      toast.error("Failed to delete schedule");
    }

    setDeleteModal({ open: false, rotaId: null, staffName: "", shiftDate: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, rotaId: null, staffName: "", shiftDate: "" });
  };

  return (
    <DashboardLayout userName={user?.name ?? "Admin"}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rota Schedules</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage all duty shift schedules ({rotas.length} total)
            </p>
          </div>
          <button
            onClick={handleAddSchedule}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add New Schedule
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          {loading && rotas.length === 0 ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground text-sm mt-3">Loading schedules...</p>
            </div>
          ) : rotas.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No schedules yet
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get started by creating your first duty schedule
              </p>
              <button
                onClick={handleAddSchedule}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" /> Add New Schedule
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground">
                    Staff Name
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground hidden md:table-cell">
                    Shift Time
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground hidden lg:table-cell">
                    Department
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rotas.map((rota) => (
                  <tr
                    key={rota.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3 px-5 text-foreground font-medium">
                      {formatDate(rota.shiftDate)}
                    </td>
                    <td className="py-3 px-5 text-foreground">
                      {rota.staffName}
                    </td>
                    <td className="py-3 px-5 text-foreground hidden md:table-cell">
                      {getShiftTimeDisplay(rota.shiftTime)}
                    </td>
                    <td className="py-3 px-5 text-foreground hidden lg:table-cell">
                      {rota.department}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditSchedule(rota.id)}
                          className="p-1.5 rounded-md hover:bg-accent text-primary transition-colors"
                          aria-label={`Edit schedule for ${rota.staffName}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(rota.id, rota.staffName, rota.shiftDate)
                          }
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                          aria-label={`Delete schedule for ${rota.staffName}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-rota-modal-title"
        >
          <div
            className="absolute inset-0 bg-foreground/20"
            onClick={handleDeleteCancel}
            aria-hidden="true"
          />
          <div className="relative bg-card rounded-xl border border-border p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 id="delete-rota-modal-title" className="text-lg font-semibold text-foreground">
                  Delete Schedule
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Are you sure you want to delete the schedule for{" "}
                  <span className="font-medium text-foreground">
                    {deleteModal.staffName}
                  </span>{" "}
                  on{" "}
                  <span className="font-medium text-foreground">
                    {deleteModal.shiftDate}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={handleDeleteCancel}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
