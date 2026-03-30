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
import { createRota, getRotaById, updateRota } from "@/services/rotaService";
import { createNotification } from "@/services/notificationService";
import type { StaffMember } from "@/services/staffService";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { SHIFT_TIMES, getShiftTimeDisplay } from "@/lib/rotaUtils";
import { userFacingFirestoreActionError } from "@/lib/firebaseQueryErrors";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateRotaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember[];
  editRotaId?: string | null;
  onSaved?: () => void;
}

export function CreateRotaDialog({
  open,
  onOpenChange,
  staff,
  editRotaId,
  onSaved,
}: CreateRotaDialogProps) {
  const isEdit = Boolean(editRotaId);

  const [staffRecordId, setStaffRecordId] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [shiftTime, setShiftTime] = useState("");
  const [department, setDepartment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingRota, setLoadingRota] = useState(false);

  useEffect(() => {
    if (!open) {
      setStaffRecordId("");
      setShiftDate("");
      setShiftTime("");
      setDepartment("");
      setErrors({});
      return;
    }

    if (isEdit && editRotaId) {
      setLoadingRota(true);
      getRotaById(editRotaId)
        .then((rota) => {
          if (rota) {
            const match =
              staff.find((s) => s.id === rota.staffId) ||
              staff.find((s) => s.authUid === rota.staffAuthUid);
            setStaffRecordId(match?.id ?? "");
            setShiftDate(rota.shiftDate);
            setShiftTime(rota.shiftTime);
            setDepartment(rota.department);
          }
        })
        .finally(() => setLoadingRota(false));
    }
  }, [open, isEdit, editRotaId, staff]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!staffRecordId) e.staff = "Select a staff member";
    if (!shiftDate) e.shiftDate = "Shift date is required";
    if (!shiftTime) e.shiftTime = "Select shift time";
    if (!department) e.department = "Select department";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const member = staff.find((s) => s.id === staffRecordId);
    if (!member) {
      setErrors({ staff: "Invalid staff selection" });
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && editRotaId) {
        await updateRota(editRotaId, {
          staffId: member.id,
          staffAuthUid: member.authUid,
          staffName: member.fullName,
          department,
          shiftDate,
          shiftTime,
        });
      } else {
        await createRota({
          staffId: member.id,
          staffAuthUid: member.authUid,
          staffName: member.fullName,
          department,
          shiftDate,
          shiftTime,
        });

        const uid = member.authUid?.trim();
        if (uid) {
          const timeLabel = getShiftTimeDisplay(shiftTime);
          try {
            await createNotification({
              userType: "staff",
              targetUserId: uid,
              title: "New Shift Assigned",
              message: `You have been assigned a shift on ${shiftDate} at ${timeLabel}.`,
              type: "rota_assigned",
              read: false,
            });
          } catch (err) {
            // Rota creation succeeded; notification is a best-effort follow-up.
            console.error("[DutyRota] createNotification failed after rota creation:", err);
            toast.warning("Rota saved, but the staff notification could not be sent.");
          }
        } else {
          toast.warning(
            "Rota saved. This staff member has no portal login linked, so no notification was sent."
          );
        }
      }

      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      setErrors({
        form: userFacingFirestoreActionError("saveRota", err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit schedule" : "Create rota"}</DialogTitle>
        </DialogHeader>

        {loadingRota ? (
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
              <Label htmlFor="rota-staff">Staff member</Label>
              <select
                id="rota-staff"
                value={staffRecordId}
                onChange={(e) => {
                  setStaffRecordId(e.target.value);
                  const m = staff.find((s) => s.id === e.target.value);
                  if (m) setDepartment(m.department);
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select staff member</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} — {s.department}
                  </option>
                ))}
              </select>
              {errors.staff && <p className="text-xs text-destructive">{errors.staff}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rota-date">Shift date</Label>
              <input
                id="rota-date"
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {errors.shiftDate && (
                <p className="text-xs text-destructive">{errors.shiftDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rota-time">Shift time</Label>
              <select
                id="rota-time"
                value={shiftTime}
                onChange={(e) => setShiftTime(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select shift</option>
                {Object.entries(SHIFT_TIMES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.shiftTime && (
                <p className="text-xs text-destructive">{errors.shiftTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rota-dept">Department</Label>
              <select
                id="rota-dept"
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

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || staff.length === 0}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : isEdit ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
