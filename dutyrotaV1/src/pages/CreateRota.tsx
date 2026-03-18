import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Save, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { useRotas } from "@/hooks/useRotas";
import { DEPARTMENTS } from "@/lib/mockData";
import { SHIFT_TIMES, ShiftTime } from "@/lib/rotaData";
import { toast } from "sonner";

interface FormData {
  staffId: string;
  staffName: string;
  shiftDate: string;
  shiftTime: string;
  department: string;
}

interface FormErrors {
  staffId?: string;
  shiftDate?: string;
  shiftTime?: string;
  department?: string;
}

export default function CreateRota() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { addRota, editRota, getRota, loading } = useRotas();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    staffId: "",
    staffName: "",
    shiftDate: "",
    shiftTime: "",
    department: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing rota data in edit mode
  useEffect(() => {
    async function loadRota() {
      if (isEditMode && id) {
        const rota = await getRota(id);
        if (rota) {
          setFormData({
            staffId: rota.staffId,
            staffName: rota.staffName,
            shiftDate: rota.shiftDate,
            shiftTime: rota.shiftTime,
            department: rota.department,
          });
        } else {
          toast.error("Schedule not found");
          navigate("/admin/rota-schedules");
        }
      }
    }
    loadRota();
  }, [isEditMode, id, getRota, navigate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.staffId) {
      newErrors.staffId = "Please select a staff member";
    }

    if (!formData.shiftDate) {
      newErrors.shiftDate = "Shift date is required";
    }

    if (!formData.shiftTime) {
      newErrors.shiftTime = "Please select a shift time";
    }

    if (!formData.department) {
      newErrors.department = "Please select a department";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const staffId = e.target.value;
    const employee = employees.find((emp) => emp.id === staffId);
    
    setFormData((prev) => ({
      ...prev,
      staffId,
      staffName: employee?.name || "",
      department: employee?.department || prev.department,
    }));
    
    if (errors.staffId) {
      setErrors((prev) => ({ ...prev, staffId: undefined }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && id) {
        await editRota(id, formData);
        toast.success("Schedule updated successfully");
      } else {
        await addRota(formData);
        toast.success("Schedule created successfully");
      }
      navigate("/admin/rota-schedules");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/rota-schedules");
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout userName={user?.name ?? "Admin"}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {isEditMode ? "Edit Schedule" : "Create Rota"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEditMode
              ? "Update the duty shift schedule"
              : "Schedule a new duty shift"}
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Staff Name */}
            <div>
              <label
                htmlFor="staffId"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Staff Name <span className="text-destructive">*</span>
              </label>
              <select
                id="staffId"
                name="staffId"
                value={formData.staffId}
                onChange={handleStaffChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.staffId ? "border-destructive" : "border-border"
                }`}
              >
                <option value="">Select Staff Member</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.department}
                  </option>
                ))}
              </select>
              {errors.staffId && (
                <p className="text-destructive text-xs mt-1">{errors.staffId}</p>
              )}
              {employees.length === 0 && (
                <p className="text-muted-foreground text-xs mt-1">
                  No employees available. Add employees first.
                </p>
              )}
            </div>

            {/* Shift Date */}
            <div>
              <label
                htmlFor="shiftDate"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Shift Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                id="shiftDate"
                name="shiftDate"
                value={formData.shiftDate}
                onChange={handleChange}
                min={today}
                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.shiftDate ? "border-destructive" : "border-border"
                }`}
              />
              {errors.shiftDate && (
                <p className="text-destructive text-xs mt-1">{errors.shiftDate}</p>
              )}
            </div>

            {/* Shift Time */}
            <div>
              <label
                htmlFor="shiftTime"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Shift Time <span className="text-destructive">*</span>
              </label>
              <select
                id="shiftTime"
                name="shiftTime"
                value={formData.shiftTime}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.shiftTime ? "border-destructive" : "border-border"
                }`}
              >
                <option value="">Select Shift</option>
                {Object.entries(SHIFT_TIMES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.shiftTime && (
                <p className="text-destructive text-xs mt-1">{errors.shiftTime}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Department <span className="text-destructive">*</span>
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.department ? "border-destructive" : "border-border"
                }`}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-destructive text-xs mt-1">{errors.department}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || loading || employees.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    {isEditMode ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditMode ? "Update Schedule" : "Save Schedule"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
