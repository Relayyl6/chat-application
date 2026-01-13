import { normalizePeople } from "@/utils/names";
import { useEffect, useState } from "react";

export function usePersistentState<T>(
  key: string,
  initialValue: T
) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return initialValue;

      const parsed = JSON.parse(stored);

      // Migration: array → normalized people
      if (key === "people" && Array.isArray(parsed)) {
        return normalizePeople(parsed) as T;
      }

      return parsed as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [key, state]);

  return [state, setState] as const;
}
