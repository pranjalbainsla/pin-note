import { useCallback, useState } from "react";
import { getPins } from "@/services/pinsService";
import type { Pin } from "@/types";

export interface FloatingPin extends Pin {
  x: number;
  y: number;
  width: number;
  height: number;
  themeIndex: number;
}

export interface PopupPosition {
  x: number;
  y: number;
}

const DEFAULT_PIN_POSITION = { x: 100, y: 100, width: 320, height: 220 };
const PIN_POSITION_SHIFT = { x: 24, y: 24 };

/**
 * Manages the pins picker popup and the list of floating (draggable)
 * pins that have been dropped into the current editor session.
 */
export function usePins() {
  const [showPinsPopup, setShowPinsPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [floatingPins, setFloatingPins] = useState<FloatingPin[]>([]);
  const [error, setError] = useState("");

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

  const openPinsPopup = useCallback(
    (position: PopupPosition) => {
      setPopupPosition(position);
      setShowPinsPopup(true);
      fetchPins();
    },
    [fetchPins],
  );

  const closePinsPopup = useCallback(() => {
    setShowPinsPopup(false);
    setPopupPosition(null);
  }, []);

  const insertPin = useCallback((pin: Pin) => {
    setShowPinsPopup(false);
    setPopupPosition(null);
    setFloatingPins((prev) => {
      const themeIndex = prev.length;
      const without = prev.filter((p) => p.id !== pin.id);
      const lastPin = without[without.length - 1];
      const position = lastPin
        ? {
            ...DEFAULT_PIN_POSITION,
            x: lastPin.x + PIN_POSITION_SHIFT.x,
            y: lastPin.y + PIN_POSITION_SHIFT.y,
          }
        : { ...DEFAULT_PIN_POSITION };
      return [...without, { ...pin, ...position, themeIndex }];
    });
  }, []);

  const removePin = useCallback((id: string) => {
    setFloatingPins((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePinPosition = useCallback(
    (id: string, x: number, y: number, width: number, height: number) => {
      setFloatingPins((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, x, y, width, height } : p,
        ),
      );
    },
    [],
  );

  return {
    showPinsPopup,
    popupPosition,
    closePinsPopup,
    pins,
    floatingPins,
    error,
    openPinsPopup,
    insertPin,
    removePin,
    updatePinPosition,
  };
}
