import { useState, useEffect, useCallback } from "react";
import {
  createRota,
  deleteRota,
  getRotaById,
  subscribeToRotas,
  updateRota,
  type RotaRecord,
} from "@/services/rotaService";
import { userFacingFirestoreSubscriptionError } from "@/lib/firebaseQueryErrors";

export type Rota = RotaRecord;

export function useRotas() {
  const [rotas, setRotas] = useState<RotaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToRotas(
      (list) => {
        setRotas(list);
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(userFacingFirestoreSubscriptionError("subscribeToRotas (admin rotas list)", e));
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const addRota = useCallback(
    async (data: Omit<RotaRecord, "id" | "createdAt" | "status">) => {
      return createRota(data);
    },
    []
  );

  const editRota = useCallback(
    async (
      id: string,
      data: Partial<
        Pick<
          RotaRecord,
          | "staffId"
          | "staffAuthUid"
          | "staffName"
          | "department"
          | "shiftDate"
          | "shiftTime"
          | "status"
        >
      >
    ) => {
      await updateRota(id, data);
      const updated = rotas.find((r) => r.id === id);
      return updated ? { ...updated, ...data } : null;
    },
    [rotas]
  );

  const removeRota = useCallback(async (id: string) => {
    await deleteRota(id);
    return true;
  }, []);

  const getRota = useCallback(async (id: string) => getRotaById(id), []);

  const getStaffRotas = useCallback(
    async (staffUid: string, displayName?: string) => {
      const filtered = rotas.filter((r) => {
        if (staffUid && r.staffAuthUid === staffUid) return true;
        if (
          staffUid &&
          (!r.staffAuthUid || r.staffAuthUid === "") &&
          r.staffId === staffUid
        )
          return true;
        if (
          displayName &&
          r.staffName.toLowerCase() === displayName.toLowerCase()
        )
          return true;
        return false;
      });
      return filtered.sort(
        (a, b) => new Date(a.shiftDate).getTime() - new Date(b.shiftDate).getTime()
      );
    },
    [rotas]
  );

  const getUpcoming = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return rotas
      .filter((r) => new Date(r.shiftDate) >= today)
      .sort(
        (a, b) => new Date(a.shiftDate).getTime() - new Date(b.shiftDate).getTime()
      );
  }, [rotas]);

  const getRecent = useCallback(
    (limit: number = 5) => {
      return [...rotas]
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit);
    },
    [rotas]
  );

  return {
    rotas,
    loading,
    error,
    addRota,
    editRota,
    removeRota,
    getRota,
    getStaffRotas,
    getUpcoming,
    getRecent,
  };
}
