/**
 * Centralized mock data store for rota schedules
 * This module can later be replaced with Firebase/Firestore calls
 */

export interface Rota {
  id: string;
  staffId: string;
  staffName: string;
  shiftDate: string;
  shiftTime: string;
  department: string;
  createdAt: string;
}

export type ShiftTime = "morning" | "afternoon" | "night";

export const SHIFT_TIMES: Record<ShiftTime, string> = {
  morning: "Morning (6:00 AM - 2:00 PM)",
  afternoon: "Afternoon (2:00 PM - 10:00 PM)",
  night: "Night (10:00 PM - 6:00 AM)",
};

// Initial seed data
const initialRotas: Rota[] = [
  {
    id: "rota-001",
    staffId: "emp-001",
    staffName: "Anne Njoroge",
    shiftDate: "2026-03-20",
    shiftTime: "morning",
    department: "News Room",
    createdAt: "2026-03-15T08:00:00.000Z",
  },
  {
    id: "rota-002",
    staffId: "emp-002",
    staffName: "John Kamau",
    shiftDate: "2026-03-20",
    shiftTime: "afternoon",
    department: "Production",
    createdAt: "2026-03-15T08:30:00.000Z",
  },
  {
    id: "rota-003",
    staffId: "emp-003",
    staffName: "Aisha Nkechi",
    shiftDate: "2026-03-21",
    shiftTime: "morning",
    department: "Editorial",
    createdAt: "2026-03-15T09:00:00.000Z",
  },
  {
    id: "rota-004",
    staffId: "emp-001",
    staffName: "Anne Njoroge",
    shiftDate: "2026-03-22",
    shiftTime: "afternoon",
    department: "News Room",
    createdAt: "2026-03-16T10:00:00.000Z",
  },
  {
    id: "rota-005",
    staffId: "emp-004",
    staffName: "Moses Ruto",
    shiftDate: "2026-03-23",
    shiftTime: "morning",
    department: "News Room",
    createdAt: "2026-03-16T11:00:00.000Z",
  },
];

// In-memory store
let rotas: Rota[] = [...initialRotas];

// Listeners for state changes
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

/**
 * Subscribe to rota data changes
 */
export function subscribeToRotas(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Get all rotas
 */
export function getRotas(): Rota[] {
  return [...rotas].sort(
    (a, b) => new Date(b.shiftDate).getTime() - new Date(a.shiftDate).getTime()
  );
}

/**
 * Get rotas for a specific staff member (by name or ID)
 */
export function getRotasByStaff(staffNameOrId: string): Rota[] {
  return rotas
    .filter(
      (r) =>
        r.staffId === staffNameOrId ||
        r.staffName.toLowerCase() === staffNameOrId.toLowerCase()
    )
    .sort(
      (a, b) => new Date(a.shiftDate).getTime() - new Date(b.shiftDate).getTime()
    );
}

/**
 * Get upcoming rotas (from today onwards)
 */
export function getUpcomingRotas(): Rota[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return rotas
    .filter((r) => new Date(r.shiftDate) >= today)
    .sort(
      (a, b) => new Date(a.shiftDate).getTime() - new Date(b.shiftDate).getTime()
    );
}

/**
 * Get recent rotas (last N entries)
 */
export function getRecentRotas(limit: number = 5): Rota[] {
  return [...rotas]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

/**
 * Get a single rota by ID
 */
export function getRotaById(id: string): Rota | undefined {
  return rotas.find((r) => r.id === id);
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `rota-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new rota entry
 */
export function createRota(
  data: Omit<Rota, "id" | "createdAt">
): Rota {
  const newRota: Rota = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  rotas = [...rotas, newRota];
  notifyListeners();
  return newRota;
}

/**
 * Update an existing rota
 */
export function updateRota(
  id: string,
  data: Partial<Omit<Rota, "id" | "createdAt">>
): Rota | null {
  const index = rotas.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated = { ...rotas[index], ...data };
  rotas = [...rotas.slice(0, index), updated, ...rotas.slice(index + 1)];
  notifyListeners();
  return updated;
}

/**
 * Delete a rota
 */
export function deleteRota(id: string): boolean {
  const index = rotas.findIndex((r) => r.id === id);
  if (index === -1) return false;

  rotas = [...rotas.slice(0, index), ...rotas.slice(index + 1)];
  notifyListeners();
  return true;
}

/**
 * Format a date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Get shift time display string
 */
export function getShiftTimeDisplay(shiftTime: string): string {
  return SHIFT_TIMES[shiftTime as ShiftTime] || shiftTime;
}
