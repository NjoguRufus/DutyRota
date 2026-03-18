/**
 * Centralized mock data store for employees
 * This module can later be replaced with Firebase/Firestore calls
 */

export interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

// Initial seed data
const initialEmployees: Employee[] = [
  {
    id: "emp-001",
    name: "Anne Njoroge",
    department: "News Room",
    email: "anne@capemedia.co.ke",
    phoneNumber: "+254 712 345 678",
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "emp-002",
    name: "John Kamau",
    department: "Production",
    email: "john@capemedia.co.ke",
    phoneNumber: "+254 723 456 789",
    createdAt: "2026-01-16T09:00:00.000Z",
  },
  {
    id: "emp-003",
    name: "Aisha Nkechi",
    department: "Editorial",
    email: "aisha@capemedia.co.ke",
    phoneNumber: "+254 734 567 890",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "emp-004",
    name: "Moses Ruto",
    department: "News Room",
    email: "moses@capemedia.co.ke",
    phoneNumber: "+254 745 678 901",
    createdAt: "2026-02-10T11:00:00.000Z",
  },
  {
    id: "emp-005",
    name: "Grace Wanjiku",
    department: "Production",
    email: "grace@capemedia.co.ke",
    phoneNumber: "+254 756 789 012",
    createdAt: "2026-03-01T08:30:00.000Z",
  },
];

// In-memory store (simulates a database)
let employees: Employee[] = [...initialEmployees];

// Listeners for state changes
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

/**
 * Subscribe to employee data changes
 */
export function subscribeToEmployees(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Get all employees
 */
export function getEmployees(): Employee[] {
  return [...employees];
}

/**
 * Get a single employee by ID
 */
export function getEmployeeById(id: string): Employee | undefined {
  return employees.find((emp) => emp.id === id);
}

/**
 * Generate a unique ID for new employees
 */
function generateId(): string {
  return `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new employee
 */
export function createEmployee(
  data: Omit<Employee, "id" | "createdAt">
): Employee {
  const newEmployee: Employee = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  employees = [...employees, newEmployee];
  notifyListeners();
  return newEmployee;
}

/**
 * Update an existing employee
 */
export function updateEmployee(
  id: string,
  data: Partial<Omit<Employee, "id" | "createdAt">>
): Employee | null {
  const index = employees.findIndex((emp) => emp.id === id);
  if (index === -1) return null;

  const updated = { ...employees[index], ...data };
  employees = [...employees.slice(0, index), updated, ...employees.slice(index + 1)];
  notifyListeners();
  return updated;
}

/**
 * Delete an employee
 */
export function deleteEmployee(id: string): boolean {
  const index = employees.findIndex((emp) => emp.id === id);
  if (index === -1) return false;

  employees = [...employees.slice(0, index), ...employees.slice(index + 1)];
  notifyListeners();
  return true;
}

/**
 * Available departments (can be extended later)
 */
export const DEPARTMENTS = [
  "News Room",
  "Production",
  "Editorial",
  "Marketing",
  "Technical",
  "Administration",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
