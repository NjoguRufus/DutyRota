import { useState, useEffect } from "react";
import {
  subscribeToRotasForStaff,
  getUpcomingRotasForStaff,
  type RotaRecord,
} from "@/services/rotaService";
import { userFacingFirestoreSubscriptionError } from "@/lib/firebaseQueryErrors";
export function useStaffRotas(staffAuthUid: string | undefined) {
  const [rotas, setRotas] = useState<RotaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!staffAuthUid) {
      setRotas([]);
      setLoading(false);
      return;
    }
    const unsub = subscribeToRotasForStaff(
      staffAuthUid,
      (list) => {
        setRotas(list);
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(
          userFacingFirestoreSubscriptionError("subscribeToRotasForStaff", e)
        );
        setLoading(false);
      }
    );
    return unsub;
  }, [staffAuthUid]);

  const upcoming = getUpcomingRotasForStaff(rotas);

  return { rotas, upcoming, loading, error };
}
