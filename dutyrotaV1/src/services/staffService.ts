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
import { db } from "@/lib/firebase";
import { createStaffAuthAccount } from "@/lib/auth";

const COLLECTION = "staff";

export interface StaffMember {
  id: string;
  fullName: string;
  department: string;
  email: string;
  phone: string;
  authUid: string;
  role: "staff";
  createdAt: string;
}

function mapStaffDoc(id: string, data: Record<string, unknown>): StaffMember {
  const created = data.createdAt as { toDate?: () => Date } | string | undefined;
  const createdAt =
    typeof created === "object" && created?.toDate
      ? created.toDate()!.toISOString()
      : String(created ?? "");

  return {
    id,
    fullName: String(data.fullName ?? ""),
    department: String(data.department ?? ""),
    email: String(data.email ?? ""),
    phone: String(data.phone ?? ""),
    authUid: String(data.authUid ?? ""),
    role: "staff",
    createdAt,
  };
}

/**
 * Create Firebase Auth user (secondary app) + users profile + staff document.
 * Password is never written to Firestore.
 */
export async function createStaffMember(input: {
  fullName: string;
  department: string;
  email: string;
  phone: string;
  portalPassword: string;
}): Promise<StaffMember> {
  const email = input.email.trim();
  const authResult = await createStaffAuthAccount(
    email,
    input.portalPassword,
    input.fullName.trim()
  );
  if ("error" in authResult) {
    throw new Error(authResult.error);
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    fullName: input.fullName.trim(),
    department: input.department,
    email,
    phone: input.phone.trim(),
    authUid: authResult.uid,
    role: "staff",
    createdAt: serverTimestamp(),
  });

  const snap = await getDoc(docRef);
  const data = snap.data();
  if (!data) throw new Error("Staff document was not created.");
  return mapStaffDoc(snap.id, data as Record<string, unknown>);
}

export async function getAllStaff(): Promise<StaffMember[]> {
  const q = query(collection(db, COLLECTION), orderBy("fullName", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapStaffDoc(d.id, d.data() as Record<string, unknown>));
}

export function subscribeToStaff(
  onNext: (staff: StaffMember[]) => void,
  onError?: (e: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION), orderBy("fullName", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      onNext(snap.docs.map((d) => mapStaffDoc(d.id, d.data() as Record<string, unknown>)));
    },
    (err) => onError?.(err)
  );
}

export async function getStaffById(id: string): Promise<StaffMember | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapStaffDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function getStaffByAuthUid(authUid: string): Promise<StaffMember | null> {
  const q = query(collection(db, COLLECTION), where("authUid", "==", authUid), limit(1));
  const snap = await getDocs(q);
  const d = snap.docs[0];
  if (!d) return null;
  return mapStaffDoc(d.id, d.data() as Record<string, unknown>);
}

export async function updateStaff(
  id: string,
  data: Partial<Pick<StaffMember, "fullName" | "department" | "phone">>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  const payload: Record<string, unknown> = {};
  if (data.fullName !== undefined) payload.fullName = data.fullName.trim();
  if (data.department !== undefined) payload.department = data.department;
  if (data.phone !== undefined) payload.phone = data.phone.trim();
  if (Object.keys(payload).length === 0) return;
  await updateDoc(ref, payload);
}

export async function deleteStaff(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
