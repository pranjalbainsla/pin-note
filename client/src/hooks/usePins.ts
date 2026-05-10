import { useCallback, useState } from "react";
import { getPins } from "../services/pinsService";
import type { Pin } from "../types";

export interface FloatingPin extends Pin {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_PIN_POSITION = { x: 100, y: 100, width: 320, height: 220 };

/**
 * Manages the pins picker popup and the list of floating (draggable)
 * pins that have been dropped into the current editor session.
 */
export function usePins() {
  const [showPinsPopup, setShowPinsPopup] = useState(false);
  const [pins, setPins]                   = useState<Pin[]>([]);
  const [floatingPins, setFloatingPins]   = useState<FloatingPin[]>([]);
  const [error, setError]                 = useState("");

  const fetchPins = useCallback(async () => {
    try {
      const res = await getPins();
      if (!res) {
        setError("Failed to fetch pins. Please try again later.");
        return;
      }
      setPins(res.pins);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const openPinsPopup = useCallback(() => {
    setShowPinsPopup(true);
    fetchPins();
  }, [fetchPins]);

  const closePinsPopup = useCallback(() => setShowPinsPopup(false), []);

  const insertPin = useCallback((pin: Pin) => {
    setShowPinsPopup(false);
    setFloatingPins((prev) => [...prev, { ...pin, ...DEFAULT_PIN_POSITION }]);
  }, []);

  return { showPinsPopup, closePinsPopup, pins, floatingPins, error, openPinsPopup, insertPin };
}