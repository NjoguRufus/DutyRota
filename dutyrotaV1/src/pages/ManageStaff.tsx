import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { toast } from "sonner";

export default function ManageStaff() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, removeEmployee, loading } = useEmployees();

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    employeeId: string | null;
    employeeName: string;
  }>({
    open: false,
    employeeId: null,
    employeeName: "",
  });

  const handleAddEmployee = () => {
    navigate("/admin/create-employee");
  };

  const handleEditEmployee = (id: string) => {
    navigate(`/admin/edit-employee/${id}`);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({
      open: true,
      employeeId: id,
      employeeName: name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.employeeId) return;

    const success = await removeEmployee(deleteModal.employeeId);
    if (success) {
      toast.success(`${deleteModal.employeeName} has been removed`);
    } else {
      toast.error("Failed to delete employee");
    }

    setDeleteModal({ open: false, employeeId: null, employeeName: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, employeeId: null, employeeName: "" });
  };

  return (
    <DashboardLayout userName={user?.name ?? "Admin"}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Staff</h1>
            <p className="text-muted-foreground text-sm mt-1">
              View and manage all employees ({employees.length} total)
            </p>
          </div>
          <button
            onClick={handleAddEmployee}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add Employee
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          {loading && employees.length === 0 ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground text-sm mt-3">Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No employees yet
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get started by adding your first employee
              </p>
              <button
                onClick={handleAddEmployee}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" /> Add Employee
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground">
                    Employee Name
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
                  <th className="text-left py-3 px-5 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3 px-5 text-foreground font-medium">
                      {employee.name}
                    </td>
                    <td className="py-3 px-5 text-foreground">
                      {employee.department}
                    </td>
                    <td className="py-3 px-5 text-foreground hidden md:table-cell">
                      {employee.email}
                    </td>
                    <td className="py-3 px-5 text-foreground hidden lg:table-cell">
                      {employee.phoneNumber}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditEmployee(employee.id)}
                          className="p-1.5 rounded-md hover:bg-accent text-primary transition-colors"
                          aria-label={`Edit ${employee.name}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(employee.id, employee.name)
                          }
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                          aria-label={`Delete ${employee.name}`}
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
                  Delete Employee
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">
                    {deleteModal.employeeName}
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
