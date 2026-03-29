import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createStaffMember,
  getStaffById,
  updateStaff,
} from "@/services/staffService";
import { createNotification } from "@/services/notificationService";
import { sendStaffPasswordResetEmail } from "@/lib/auth";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { userFacingFirestoreActionError } from "@/lib/firebaseQueryErrors";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  staffFirestoreId?: string | null;
  adminUid?: string;
  onSaved?: () => void;
}

export function StaffFormDialog({
  open,
  onOpenChange,
  mode,
  staffFirestoreId,
  adminUid,
  onSaved,
}: StaffFormDialogProps) {
  const isEdit = mode === "edit";

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    if (!open) {
      setFullName("");
      setDepartment("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setErrors({});
      return;
    }

    if (isEdit && staffFirestoreId) {
      setLoadingStaff(true);
      getStaffById(staffFirestoreId)
        .then((m) => {
          if (m) {
            setFullName(m.fullName);
            setDepartment(m.department);
            setEmail(m.email);
            setPhone(m.phone);
          }
        })
        .finally(() => setLoadingStaff(false));
    }
  }, [open, isEdit, staffFirestoreId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Name is required";
    if (!department) e.department = "Department is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!phone.trim()) e.phone = "Phone is required";
    if (!isEdit) {
      if (!password) e.password = "Password is required";
      else if (password.length < 6) e.password = "At least 6 characters";
      if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      if (isEdit && staffFirestoreId) {
        await updateStaff(staffFirestoreId, {
          fullName: fullName.trim(),
          department,
          phone: phone.trim(),
        });
      } else {
        const created = await createStaffMember({
          fullName: fullName.trim(),
          department,
          email: email.trim(),
          phone: phone.trim(),
          portalPassword: password,
        });

        if (adminUid) {
          await createNotification({
            userType: "admin",
            targetUserId: adminUid,
            title: "Staff member added",
            message: `${created.fullName} was added to the staff directory.`,
            type: "staff_created",
            read: false,
          });
        }
      }

      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      setErrors({
        form: userFacingFirestoreActionError("staffFormSubmit", err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReset = async () => {
    if (!email) return;
    setSendingReset(true);
    try {
      const r = await sendStaffPasswordResetEmail(email);
      if ("error" in r) setErrors({ form: r.error });
      else toast.success("If an account exists, a reset email was sent.");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit staff member" : "Add staff member"}
          </DialogTitle>
        </DialogHeader>

        {loadingStaff ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <p className="text-sm text-destructive" role="alert">
                {errors.form}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="sf-name">Employee name</Label>
              <input
                id="sf-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sf-dept">Department</Label>
              <select
                id="sf-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-xs text-destructive">{errors.department}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sf-email">Email</Label>
              <input
                id="sf-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEdit}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sf-phone">Phone number</Label>
              <input
                id="sf-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            {!isEdit && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sf-pass">Password</Label>
                  <input
                    id="sf-pass"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sf-pass2">Confirm password</Label>
                  <input
                    id="sf-pass2"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}

            {isEdit && (
              <div className="rounded-md border border-border p-3 text-sm">
                <p className="text-muted-foreground mb-2">
                  Reset password via email (cannot set another user&apos;s password in-app).
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={sendingReset || !email}
                  onClick={handleSendReset}
                >
                  {sendingReset ? "Sending…" : "Send reset email"}
                </Button>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Add staff member"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
