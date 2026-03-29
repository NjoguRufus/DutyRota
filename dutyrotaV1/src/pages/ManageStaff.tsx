import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStaff } from "@/hooks/useStaff";
import { StaffFormDialog } from "@/components/staff/StaffFormDialog";
import { formatDate } from "@/lib/rotaUtils";
import { toast } from "sonner";

function formatCreatedAt(iso: string): string {
  if (!iso) return "—";
  const day = iso.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return formatDate(day);
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : formatDate(d.toISOString().slice(0, 10));
}

export default function ManageStaff() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { staff, removeStaffMember, loading, error } = useStaff();

  const [addOpen, setAddOpen] = useState(false);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);

  useEffect(() => {
    const st = location.state as { openAddStaff?: boolean } | null;
    if (st?.openAddStaff) {
      setAddOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const edit = searchParams.get("edit");
    if (edit) {
      setEditStaffId(edit);
      const next = new URLSearchParams(searchParams);
      next.delete("edit");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    staffId: string | null;
    staffName: string;
  }>({
    open: false,
    staffId: null,
    staffName: "",
  });

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({
      open: true,
      staffId: id,
      staffName: name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.staffId) return;

    try {
      await removeStaffMember(deleteModal.staffId);
      toast.success(`${deleteModal.staffName} has been removed`);
    } catch {
      toast.error("Failed to delete staff member");
    }

    setDeleteModal({ open: false, staffId: null, staffName: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, staffId: null, staffName: "" });
  };

  return (
    <DashboardLayout userName={user?.name ?? "Admin"}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Staff</h1>
            <p className="text-muted-foreground text-sm mt-1">
              View and manage all staff ({staff.length} total)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add Staff Member
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
          {loading && staff.length === 0 ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground text-sm mt-3">Loading staff...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No staff yet
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Add a staff member to assign rotas and enable staff portal login
              </p>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" /> Add Staff Member
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground">
                    Full name
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground">
                    Department
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground hidden lg:table-cell">
                    Phone
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground hidden xl:table-cell">
                    Added
                  </th>
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3 px-5 text-foreground font-medium">
                      {member.fullName}
                    </td>
                    <td className="py-3 px-5 text-foreground">
                      {member.department}
                    </td>
                    <td className="py-3 px-5 text-foreground hidden md:table-cell">
                      {member.email}
                    </td>
                    <td className="py-3 px-5 text-foreground hidden lg:table-cell">
                      {member.phone}
                    </td>
                    <td className="py-3 px-5 text-foreground hidden xl:table-cell text-muted-foreground">
                      {formatCreatedAt(member.createdAt)}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditStaffId(member.id)}
                          className="p-1.5 rounded-md hover:bg-accent text-primary transition-colors"
                          aria-label={`Edit ${member.fullName}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(member.id, member.fullName)
                          }
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                          aria-label={`Delete ${member.fullName}`}
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

      <StaffFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="add"
        adminUid={user?.uid}
        onSaved={() => toast.success("Staff member added")}
      />

      <StaffFormDialog
        open={editStaffId != null}
        onOpenChange={(o) => {
          if (!o) setEditStaffId(null);
        }}
        mode="edit"
        staffFirestoreId={editStaffId}
        onSaved={() => {
          toast.success("Staff member updated");
          setEditStaffId(null);
        }}
      />

      {deleteModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
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
                <h3 id="delete-modal-title" className="text-lg font-semibold text-foreground">
                  Delete staff member
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Are you sure you want to remove{" "}
                  <span className="font-medium text-foreground">
                    {deleteModal.staffName}
                  </span>
                  ? Their Firestore record will be removed. Their Firebase Authentication account is not deleted automatically.
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
