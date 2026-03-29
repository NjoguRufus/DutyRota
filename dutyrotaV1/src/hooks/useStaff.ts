import { useState, useEffect, useCallback } from "react";
import {
  createStaffMember,
  deleteStaff,
  getStaffById,
  subscribeToStaff,
  updateStaff,
  type StaffMember,
} from "@/services/staffService";
import { userFacingFirestoreSubscriptionError } from "@/lib/firebaseQueryErrors";

export type { StaffMember };

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToStaff(
      (list) => {
        setStaff(list);
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(userFacingFirestoreSubscriptionError("subscribeToStaff", e));
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const addStaffMember = useCallback(
    async (input: {
      fullName: string;
      department: string;
      email: string;
      phone: string;
      portalPassword: string;
    }) => {
      return createStaffMember(input);
    },
    []
  );

  const editStaffMember = useCallback(
    async (id: string, data: Partial<Pick<StaffMember, "fullName" | "department" | "phone">>) => {
      await updateStaff(id, data);
    },
    []
  );

  const removeStaffMember = useCallback(async (id: string) => {
    await deleteStaff(id);
    return true;
  }, []);

  const getStaffMember = useCallback(async (id: string) => getStaffById(id), []);

  return {
    staff,
    loading,
    error,
    addStaffMember,
    editStaffMember,
    removeStaffMember,
    getStaffMember,
  };
}
