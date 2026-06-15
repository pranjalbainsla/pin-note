import { useEffect } from "react";
import type { RefObject } from "react";
import type { Pin } from "@/types";
import type { PopupPosition } from "@/hooks/usePins";

interface PinsPopupProps {
  pins: Pin[];
  position: PopupPosition;
  boundsRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  onSelect: (pin: Pin) => void;
}

export default function PinsPopup({
  pins,
  position,
  boundsRef,
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

  const bounds = boundsRef?.current?.getBoundingClientRect();
  const offsetX = bounds?.left ?? 0;
  const offsetY = bounds?.top ?? 0;
  const boundsWidth = bounds?.width ?? window.innerWidth;
  const boundsHeight = bounds?.height ?? window.innerHeight;

  const menuWidth = 280;
  const menuMaxHeight = 320;

  const left = Math.min(
    position.x - offsetX,
    boundsWidth - menuWidth - 16,
  );
  const top = Math.min(
    position.y - offsetY,
    boundsHeight - menuMaxHeight - 16,
  );

  return (
    <>
      <div className="absolute inset-0 z-40" onClick={onClose} aria-hidden="true" />

      <div
        className="absolute z-50 w-[280px] max-h-[320px] overflow-hidden rounded-2xl border border-[var(--slate-border)] bg-[var(--slate-surface)]/85 backdrop-blur-md shadow-[var(--slate-shadow)] popup-animate-in"
        style={{ left, top }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-2 border-b border-[var(--slate-border)]">
          <p className="text-xs font-medium text-[var(--slate-muted)] uppercase tracking-wide font-[family-name:var(--font-ui)]">
            Insert pin
          </p>
        </div>

        <div className="overflow-y-auto max-h-[280px] scrollbar-none py-1">
          {pins.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[var(--slate-muted)] text-center font-[family-name:var(--font-ui)]">
              No pins yet — add a YouTube link from Add Pin
            </p>
          ) : (
            pins.map((pin) => (
              <button
                key={pin.id}
                type="button"
                onClick={() => onSelect(pin)}
                className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors border-b border-[var(--slate-border)] last:border-b-0"
              >
                <p className="text-sm font-medium text-[var(--slate-surface-text)] truncate font-[family-name:var(--font-ui)]">
                  {pin.title}
                </p>
                <p className="text-xs text-[var(--slate-muted)] line-clamp-2 mt-0.5 leading-relaxed font-[family-name:var(--font-serif)]">
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
