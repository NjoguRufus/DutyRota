/** Department options for staff and rotas (Firestore values) */
export const DEPARTMENTS = [
  "Newsroom",
  "Production",
  "Editorial",
  "Marketing",
  "Technical",
  "Administration",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
