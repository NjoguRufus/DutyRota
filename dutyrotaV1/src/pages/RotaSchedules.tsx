import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, AlertTriangle, CalendarDays, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRotas } from "@/hooks/useRotas";
import { useStaff } from "@/hooks/useStaff";
import { CreateRotaDialog } from "@/components/rota/CreateRotaDialog";
import { formatDate, getShiftTimeDisplay } from "@/lib/rotaUtils";
import { toast } from "sonner";

export default function RotaSchedules() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { rotas, removeRota, loading, error } = useRotas();
  const { staff } = useStaff();

  const [createOpen, setCreateOpen] = useState(false);
  const [editRotaId, setEditRotaId] = useState<string | null>(null);

  useEffect(() => {
    const st = location.state as { openCreateRota?: boolean } | null;
    if (st?.openCreateRota) {
      setCreateOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const rid = searchParams.get("editRota");
    if (rid) {
      setEditRotaId(rid);
      const next = new URLSearchParams(searchParams);
      next.delete("editRota");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const sortedRotas = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [...rotas].sort((a, b) => {
      const da = new Date(a.shiftDate).getTime();
      const db = new Date(b.shiftDate).getTime();
      const aUp = new Date(a.shiftDate) >= today;
      const bUp = new Date(b.shiftDate) >= today;
      if (aUp !== bUp) return aUp ? -1 : 1;
      if (aUp) return da - db;
      return db - da;
    });
  }, [rotas]);

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

  const handleDeleteClick = (rotaId: string, staffName: string, shiftDate: string) => {
    setDeleteModal({
      open: true,
      rotaId,
      staffName,
      shiftDate: formatDate(shiftDate),
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.rotaId) return;

    try {
      await removeRota(deleteModal.rotaId);
      toast.success("Schedule deleted successfully");
    } catch {
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
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Create Rota
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm"
          >
            {error}
          </div>
        )}

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
                Create a rota to assign shifts to staff
              </p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" /> Create Rota
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
                    Staff name
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground hidden md:table-cell">
                    Shift time
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground hidden lg:table-cell">
                    Department
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRotas.map((rota) => (
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
                    <td className="py-3 px-5 text-foreground capitalize">
                      {rota.status || "scheduled"}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditRotaId(rota.id)}
                          className="p-1.5 rounded-md hover:bg-accent text-primary transition-colors"
                          aria-label={`Edit schedule for ${rota.staffName}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
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

      <CreateRotaDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        staff={staff}
        onSaved={() => toast.success("Rota saved")}
      />

      <CreateRotaDialog
        open={editRotaId != null}
        onOpenChange={(o) => {
          if (!o) setEditRotaId(null);
        }}
        staff={staff}
        editRotaId={editRotaId ?? undefined}
        onSaved={() => {
          toast.success("Schedule updated");
          setEditRotaId(null);
        }}
      />

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
                  Delete schedule
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
                  ? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
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
