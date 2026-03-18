import { useState, useEffect, useCallback } from "react";
import { USE_MOCK_DATA } from "@/lib/config";

// Mock data imports
import {
  Rota,
  getRotas,
  getRotaById,
  getRotasByStaff,
  getUpcomingRotas,
  getRecentRotas,
  createRota,
  updateRota,
  deleteRota,
  subscribeToRotas,
} from "@/lib/rotaData";

// Firebase imports
import {
  FirebaseRota,
  getFirebaseRotas,
  getFirebaseRotaById,
  getFirebaseRotasByStaff,
  createFirebaseRota,
  updateFirebaseRota,
  deleteFirebaseRota,
  subscribeToFirebaseRotas,
} from "@/lib/firebaseRotas";

// Re-export types
export type { Rota };

/**
 * Hook for accessing and managing rota data
 * Supports both mock data and Firebase based on USE_MOCK_DATA config
 */
export function useRotas() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize and subscribe to data changes
  useEffect(() => {
    if (USE_MOCK_DATA) {
      setRotas(getRotas());
      setLoading(false);
      
      const unsubscribe = subscribeToRotas(() => {
        setRotas(getRotas());
      });
      return unsubscribe;
    } else {
      const unsubscribe = subscribeToFirebaseRotas((data) => {
        setRotas(data as Rota[]);
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  const addRota = useCallback(
    async (data: Omit<Rota, "id" | "createdAt">) => {
      setLoading(true);
      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const newRota = createRota(data);
          setLoading(false);
          return newRota;
        } else {
          const newRota = await createFirebaseRota(data);
          setLoading(false);
          return newRota as Rota;
        }
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    []
  );

  const editRota = useCallback(
    async (id: string, data: Partial<Omit<Rota, "id" | "createdAt">>) => {
      setLoading(true);
      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const updated = updateRota(id, data);
          setLoading(false);
          return updated;
        } else {
          await updateFirebaseRota(id, data);
          const updated = rotas.find((r) => r.id === id);
          setLoading(false);
          return updated ? { ...updated, ...data } : null;
        }
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [rotas]
  );

  const removeRota = useCallback(async (id: string) => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const success = deleteRota(id);
        setLoading(false);
        return success;
      } else {
        await deleteFirebaseRota(id);
        setLoading(false);
        return true;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const getRota = useCallback(
    async (id: string) => {
      if (USE_MOCK_DATA) {
        return getRotaById(id);
      } else {
        return (await getFirebaseRotaById(id)) as Rota | null;
      }
    },
    []
  );

  const getStaffRotas = useCallback(
    async (staffNameOrId: string) => {
      if (USE_MOCK_DATA) {
        return getRotasByStaff(staffNameOrId);
      } else {
        return (await getFirebaseRotasByStaff(staffNameOrId)) as Rota[];
      }
    },
    []
  );

  // These helper functions work on the current state
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
    addRota,
    editRota,
    removeRota,
    getRota,
    getStaffRotas,
    getUpcoming,
    getRecent,
  };
}
