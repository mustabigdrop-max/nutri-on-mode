import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the current local date as "yyyy-MM-dd".
 * Avoids the UTC timezone issue with toISOString() that causes
 * the date to flip at 21h in Brazil (UTC-3).
 */
export function getLocalDateStr(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the UTC ISO boundaries that correspond to the user's local day.
 * Useful when filtering timestamp columns (created_at) without mixing
 * records from yesterday/tomorrow around timezone boundaries.
 */
export function getLocalDayBounds(date?: Date) {
  const d = date ?? new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);

  return {
    date: getLocalDateStr(d),
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

/** Converte qualquer valor em string de forma segura (null/undefined -> ""). */
export const safeString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return String(value);
  } catch {
    return "";
  }
};

/** safeString + lowercase */
export const safeLower = (value: unknown): string => safeString(value).toLowerCase();
