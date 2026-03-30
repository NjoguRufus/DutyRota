import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const COLLECTION = "rotas";

export interface RotaRecord {
  id: string;
  /** Firestore `staff` document id */
  staffId: string;
  /** Firebase Auth uid of the staff member */
  staffAuthUid: string;
  staffName: string;
  department: string;
  shiftDate: string;
  shiftTime: string;
  createdBy: string;
  status: string;
  createdAt: string;
}

function mapRotaDoc(id: string, data: Record<string, unknown>): RotaRecord {
  const created = data.createdAt as { toDate?: () => Date } | string | undefined;
  const createdAt =
    typeof created === "object" && created?.toDate
      ? created.toDate()!.toISOString()
      : String(created ?? "");

  return {
    id,
    staffId: String(data.staffId ?? ""),
    staffAuthUid: String(data.staffAuthUid ?? ""),
    staffName: String(data.staffName ?? ""),
    department: String(data.department ?? ""),
    shiftDate: String(data.shiftDate ?? ""),
    shiftTime: String(data.shiftTime ?? ""),
    createdBy: String(data.createdBy ?? ""),
    status: String(data.status ?? "scheduled"),
    createdAt,
  };
}

export async function createRota(input: {
  staffId: string;
  staffAuthUid: string;
  staffName: string;
  department: string;
  shiftDate: string;
  shiftTime: string;
}): Promise<RotaRecord> {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docRef = await addDoc(collection(db, COLLECTION), {
    staffId: input.staffId,
    staffAuthUid: input.staffAuthUid ?? "",
    staffName: input.staffName,
    department: input.department,
    shiftDate: input.shiftDate,
    shiftTime: input.shiftTime,
    createdBy: user.uid,
    status: "scheduled",
    createdAt: serverTimestamp(),
  });
  const snap = await getDoc(docRef);
  const data = snap.data();
  if (!data) throw new Error("Rota was not created.");
  return mapRotaDoc(snap.id, data as Record<string, unknown>);
}

export async function getAllRotas(): Promise<RotaRecord[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy("shiftDate", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapRotaDoc(d.id, d.data() as Record<string, unknown>));
}

export function subscribeToRotas(
  onNext: (rotas: RotaRecord[]) => void,
  onError?: (e: Error) => void
): () => void {
  const q = query(
    collection(db, COLLECTION),
    orderBy("shiftDate", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      onNext(snap.docs.map((d) => mapRotaDoc(d.id, d.data() as Record<string, unknown>)));
    },
    (err) => onError?.(err)
  );
}

/** Real-time rotas assigned to a staff member (by Auth uid). */
export function subscribeToRotasForStaff(
  staffAuthUid: string,
  onNext: (rotas: RotaRecord[]) => void,
  onError?: (e: Error) => void
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where("staffAuthUid", "==", staffAuthUid),
    orderBy("shiftDate", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      onNext(snap.docs.map((d) => mapRotaDoc(d.id, d.data() as Record<string, unknown>)));
    },
    (err) => onError?.(err)
  );
}

export async function getRotasForStaff(staffAuthUid: string): Promise<RotaRecord[]> {
  const q = query(
    collection(db, COLLECTION),
    where("staffAuthUid", "==", staffAuthUid),
    orderBy("shiftDate", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapRotaDoc(d.id, d.data() as Record<string, unknown>));
}

export function getUpcomingRotasForStaff(rotas: RotaRecord[]): RotaRecord[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return rotas
    .filter((r) => new Date(r.shiftDate) >= today)
    .sort((a, b) => new Date(a.shiftDate).getTime() - new Date(b.shiftDate).getTime());
}

export async function getRotaById(id: string): Promise<RotaRecord | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapRotaDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function updateRota(
  id: string,
  data: Partial<
    Pick<
      RotaRecord,
      "staffId" | "staffAuthUid" | "staffName" | "department" | "shiftDate" | "shiftTime" | "status"
    >
  >
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  const payload: Record<string, unknown> = { ...data };
  if (Object.keys(payload).length === 0) return;
  await updateDoc(ref, payload);
}

export async function deleteRota(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getRotasByDateRange(
  startDate: string,
  endDate: string
): Promise<RotaRecord[]> {
  const q = query(
    collection(db, COLLECTION),
    where("shiftDate", ">=", startDate),
    where("shiftDate", "<=", endDate),
    orderBy("shiftDate", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapRotaDoc(d.id, d.data() as Record<string, unknown>));
}
