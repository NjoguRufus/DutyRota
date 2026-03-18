/**
 * Firebase Firestore operations for Employees
 * This module handles all employee CRUD operations with Firestore
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
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface FirebaseEmployee {
  id: string;
  name: string;
  department: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

const COLLECTION_NAME = "employees";

/**
 * Get all employees from Firestore
 */
export async function getFirebaseEmployees(): Promise<FirebaseEmployee[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
  })) as FirebaseEmployee[];
}

/**
 * Get a single employee by ID
 */
export async function getFirebaseEmployeeById(id: string): Promise<FirebaseEmployee | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt,
  } as FirebaseEmployee;
}

/**
 * Create a new employee in Firestore
 */
export async function createFirebaseEmployee(
  data: Omit<FirebaseEmployee, "id" | "createdAt">
): Promise<FirebaseEmployee> {
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
 * Update an existing employee in Firestore
 */
export async function updateFirebaseEmployee(
  id: string,
  data: Partial<Omit<FirebaseEmployee, "id" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, data);
}

/**
 * Delete an employee from Firestore
 */
export async function deleteFirebaseEmployee(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Subscribe to real-time employee updates
 */
export function subscribeToFirebaseEmployees(
  callback: (employees: FirebaseEmployee[]) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const employees = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    })) as FirebaseEmployee[];
    
    callback(employees);
  });
  
  return unsubscribe;
}
