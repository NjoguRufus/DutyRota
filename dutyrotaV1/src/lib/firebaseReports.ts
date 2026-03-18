/**
 * Firebase Firestore operations for Reports
 * This module handles all report CRUD operations with Firestore
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface FirebaseReport {
  id: string;
  reportName: string;
  reportType: "weekly" | "monthly" | "department";
  reportDate: string;
  generatedAt: string;
  fileType: "csv" | "pdf" | "xlsx";
}

const COLLECTION_NAME = "reports";

/**
 * Get all reports from Firestore
 */
export async function getFirebaseReports(): Promise<FirebaseReport[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("generatedAt", "desc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    generatedAt: doc.data().generatedAt?.toDate?.()?.toISOString() || doc.data().generatedAt,
  })) as FirebaseReport[];
}

/**
 * Get a single report by ID
 */
export async function getFirebaseReportById(id: string): Promise<FirebaseReport | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
    generatedAt: docSnap.data().generatedAt?.toDate?.()?.toISOString() || docSnap.data().generatedAt,
  } as FirebaseReport;
}

/**
 * Create a new report in Firestore
 */
export async function createFirebaseReport(
  data: Omit<FirebaseReport, "id" | "generatedAt">
): Promise<FirebaseReport> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    generatedAt: Timestamp.now(),
  });
  
  return {
    id: docRef.id,
    ...data,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Delete a report from Firestore
 */
export async function deleteFirebaseReport(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Subscribe to real-time report updates
 */
export function subscribeToFirebaseReports(
  callback: (reports: FirebaseReport[]) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy("generatedAt", "desc"));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      generatedAt: doc.data().generatedAt?.toDate?.()?.toISOString() || doc.data().generatedAt,
    })) as FirebaseReport[];
    
    callback(reports);
  });
  
  return unsubscribe;
}
