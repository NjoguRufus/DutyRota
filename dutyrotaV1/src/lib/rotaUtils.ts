/** Display helpers for shift times and dates (no mock rota data). */

export type ShiftTime = "morning" | "afternoon" | "night";

export const SHIFT_TIMES: Record<ShiftTime, string> = {
  morning: "Morning (6:00 AM - 2:00 PM)",
  afternoon: "Afternoon (2:00 PM - 10:00 PM)",
  night: "Night (10:00 PM - 6:00 AM)",
};

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getShiftTimeDisplay(shiftTime: string): string {
  return SHIFT_TIMES[shiftTime as ShiftTime] || shiftTime;
}
