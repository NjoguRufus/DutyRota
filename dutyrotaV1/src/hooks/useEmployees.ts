import { useState, useEffect, useCallback } from "react";
import { USE_MOCK_DATA } from "@/lib/config";

// Mock data imports
import {
  Employee,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  subscribeToEmployees,
} from "@/lib/mockData";

// Firebase imports
import {
  FirebaseEmployee,
  getFirebaseEmployees,
  getFirebaseEmployeeById,
  createFirebaseEmployee,
  updateFirebaseEmployee,
  deleteFirebaseEmployee,
  subscribeToFirebaseEmployees,
} from "@/lib/firebaseEmployees";

// Re-export Employee type for consumers
export type { Employee };

/**
 * Hook for accessing and managing employee data
 * Supports both mock data and Firebase based on USE_MOCK_DATA config
 */
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize and subscribe to data changes
  useEffect(() => {
    if (USE_MOCK_DATA) {
      // Mock mode: synchronous initial load
      setEmployees(getEmployees());
      setLoading(false);
      
      const unsubscribe = subscribeToEmployees(() => {
        setEmployees(getEmployees());
      });
      return unsubscribe;
    } else {
      // Firebase mode: real-time subscription
      const unsubscribe = subscribeToFirebaseEmployees((data) => {
        setEmployees(data as Employee[]);
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  const addEmployee = useCallback(
    async (data: Omit<Employee, "id" | "createdAt">) => {
      setLoading(true);
      try {
        if (USE_MOCK_DATA) {
          // Simulate network delay for realistic UX
          await new Promise((resolve) => setTimeout(resolve, 300));
          const newEmployee = createEmployee(data);
          setLoading(false);
          return newEmployee;
        } else {
          const newEmployee = await createFirebaseEmployee(data);
          setLoading(false);
          return newEmployee as Employee;
        }
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    []
  );

  const editEmployee = useCallback(
    async (id: string, data: Partial<Omit<Employee, "id" | "createdAt">>) => {
      setLoading(true);
      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const updated = updateEmployee(id, data);
          setLoading(false);
          return updated;
        } else {
          await updateFirebaseEmployee(id, data);
          // Return the updated employee from current state
          const updated = employees.find((e) => e.id === id);
          setLoading(false);
          return updated ? { ...updated, ...data } : null;
        }
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [employees]
  );

  const removeEmployee = useCallback(async (id: string) => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const success = deleteEmployee(id);
        setLoading(false);
        return success;
      } else {
        await deleteFirebaseEmployee(id);
        setLoading(false);
        return true;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const getEmployee = useCallback(
    async (id: string) => {
      if (USE_MOCK_DATA) {
        return getEmployeeById(id);
      } else {
        return (await getFirebaseEmployeeById(id)) as Employee | null;
      }
    },
    []
  );

  return {
    employees,
    loading,
    addEmployee,
    editEmployee,
    removeEmployee,
    getEmployee,
  };
}
