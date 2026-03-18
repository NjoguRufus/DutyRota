/**
 * Firebase Firestore operations for Rotas
 * This module handles all rota CRUD operations with Firestore
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface FirebaseRota {
  id: string;
  staffId: string;
  staffName: string;
  shiftDate: string;
  shiftTime: string;
  department: string;
  createdAt: string;
}

const COLLECTION_NAME = "rotas";

/**
 * Get all rotas from Firestore
 */
export async function getFirebaseRotas(): Promise<FirebaseRota[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("shiftDate", "desc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
  })) as FirebaseRota[];
}

/**
 * Get rotas for a specific staff member
 */
export async function getFirebaseRotasByStaff(staffName: string): Promise<FirebaseRota[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("staffName", "==", staffName),
    orderBy("shiftDate", "asc")
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
  })) as FirebaseRota[];
}

/**
 * Get a single rota by ID
 */
export async function getFirebaseRotaById(id: string): Promise<FirebaseRota | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt,
  } as FirebaseRota;
}

/**
 * Create a new rota in Firestore
 */
export async function createFirebaseRota(
  data: Omit<FirebaseRota, "id" | "createdAt">
): Promise<FirebaseRota> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: Timestamp.now(),
  });
  
  return {
    id: docRef.id,
    ...data,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Update an existing rota in Firestore
 */
export async function updateFirebaseRota(
  id: string,
  data: Partial<Omit<FirebaseRota, "id" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, data);
}

/**
 * Delete a rota from Firestore
 */
export async function deleteFirebaseRota(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Subscribe to real-time rota updates
 */
export function subscribeToFirebaseRotas(
  callback: (rotas: FirebaseRota[]) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy("shiftDate", "desc"));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const rotas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    })) as FirebaseRota[];
    
    callback(rotas);
  });
  
  return unsubscribe;
}
