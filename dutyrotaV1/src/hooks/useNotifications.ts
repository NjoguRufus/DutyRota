import { useState, useEffect, useMemo, useCallback } from "react";
import {
  subscribeToNotifications,
  markNotificationAsRead,
  type AppNotification,
} from "@/services/notificationService";
import { userFacingFirestoreSubscriptionError } from "@/lib/firebaseQueryErrors";

export function useNotifications(targetUserId: string | undefined) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUserId) {
      setItems([]);
      setLoading(false);
      return;
    }
    const unsub = subscribeToNotifications(
      targetUserId,
      (list) => {
        setItems(list);
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(
          userFacingFirestoreSubscriptionError("subscribeToNotifications", e)
        );
        setLoading(false);
      }
    );
    return unsub;
  }, [targetUserId]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markAsRead = useCallback(async (id: string) => {
    await markNotificationAsRead(id);
  }, []);

  return { notifications: items, unreadCount, loading, error, markAsRead };
}
