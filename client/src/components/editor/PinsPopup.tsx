import { useEffect } from "react";
import type { Pin } from "../../types";
import type { PopupPosition } from "../../hooks/usePins";

interface PinsPopupProps {
  pins: Pin[];
  position: PopupPosition;
  onClose: () => void;
  onSelect: (pin: Pin) => void;
}

export default function PinsPopup({
  pins,
  position,
  onClose,
  onSelect,
}: PinsPopupProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const menuWidth = 280;
  const menuMaxHeight = 320;

  const left = Math.min(position.x, viewportWidth - menuWidth - 16);
  const top = Math.min(position.y, viewportHeight - menuMaxHeight - 16);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

      <div
        className="fixed z-50 w-[280px] max-h-[320px] overflow-hidden rounded-2xl border border-[#E8E6E1]/80 bg-white/85 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] popup-animate-in"
        style={{ left, top }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-2 border-b border-[#E8E6E1]/60">
          <p className="text-xs font-medium text-[#8A8A8A] uppercase tracking-wide font-[family-name:var(--font-ui)]">
            Insert pin
          </p>
        </div>

        <div className="overflow-y-auto max-h-[280px] scrollbar-none py-1">
          {pins.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[#8A8A8A] text-center font-[family-name:var(--font-ui)]">
              No pins yet — add a YouTube link from Add Pin
            </p>
          ) : (
            pins.map((pin) => (
              <button
                key={pin.id}
                type="button"
                onClick={() => onSelect(pin)}
                className="w-full text-left px-4 py-3 hover:bg-[#F0EEEA] transition-colors border-b border-[#E8E6E1]/40 last:border-b-0"
              >
                <p className="text-sm font-medium text-[#2D2D2D] truncate font-[family-name:var(--font-ui)]">
                  {pin.title}
                </p>
                <p className="text-xs text-[#4A4A4A] line-clamp-2 mt-0.5 leading-relaxed font-[family-name:var(--font-serif)]">
                  {pin.summary}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
