import { useCallback, useEffect, useRef } from "react";

/**
 * Debounces a save function. Every call to `schedule` resets the timer.
 * Uses a ref to always call the latest saveFn without recreating the timeout,
 * avoiding a subtle stale-closure bug.
 */
export function useAutoSave(saveFn: () => void, delayMs: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveFnRef  = useRef(saveFn);

  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  const schedule = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => saveFnRef.current(), delayMs);
  }, [delayMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { scheduleAutoSave: schedule };
}