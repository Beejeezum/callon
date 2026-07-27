import { clsx, type ClassValue } from "clsx";

export function cn(...values: ClassValue[]) {
  return clsx(values);
}

export function percentComplete(committed: number, requested: number) {
  if (requested <= 0) return 0;
  return Math.min(100, Math.round((committed / requested) * 100));
}
