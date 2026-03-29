import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION = "notifications";

export type NotificationUserType = "staff" | "admin";
export type NotificationType = "rota_assigned" | "system" | "staff_created";

export interface AppNotification {
  id: string;
  userType: NotificationUserType;
  targetUserId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

function mapNotificationDoc(id: string, data: Record<string, unknown>): AppNotification {
  const created = data.createdAt as { toDate?: () => Date } | string | undefined;
  const createdAt =
    typeof created === "object" && created?.toDate
      ? created.toDate()!.toISOString()
      : String(created ?? "");

  return {
    id,
    userType: (data.userType as NotificationUserType) ?? "staff",
    targetUserId: String(data.targetUserId ?? ""),
    title: String(data.title ?? ""),
    message: String(data.message ?? ""),
    type: (data.type as NotificationType) ?? "system",
    read: Boolean(data.read),
    createdAt,
  };
}

export async function createNotification(input: {
  userType: NotificationUserType;
  targetUserId: string;
  title: string;
  message: string;
  type: NotificationType;
  read?: boolean;
}): Promise<AppNotification> {
  const ref = await addDoc(collection(db, COLLECTION), {
    userType: input.userType,
    targetUserId: input.targetUserId,
    title: input.title,
    message: input.message,
    type: input.type,
    read: input.read ?? false,
    createdAt: serverTimestamp(),
  });
  const snap = await getDoc(doc(db, COLLECTION, ref.id));
  if (!snap.exists()) throw new Error("Notification was not created.");
  return mapNotificationDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function getNotificationsForUser(targetUserId: string): Promise<AppNotification[]> {
  const q = query(
    collection(db, COLLECTION),
    where("targetUserId", "==", targetUserId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapNotificationDoc(d.id, d.data() as Record<string, unknown>));
}

export function subscribeToNotifications(
  targetUserId: string,
  onNext: (items: AppNotification[]) => void,
  onError?: (e: Error) => void
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where("targetUserId", "==", targetUserId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      onNext(snap.docs.map((d) => mapNotificationDoc(d.id, d.data() as Record<string, unknown>)));
    },
    (err) => onError?.(err)
  );
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, notificationId), { read: true });
}
