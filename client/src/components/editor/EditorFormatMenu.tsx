import { useEffect } from "react";
import type { RefObject } from "react";
import type { Editor } from "@tiptap/react";
import type { PopupPosition } from "@/hooks/useEditorFormatMenu";
import {
  MAX_FONT_SIZE_PX,
  MIN_FONT_SIZE_PX,
} from "@/constants/editor";

interface EditorFormatMenuProps {
  editor: Editor;
  position: PopupPosition;
  boundsRef?: RefObject<HTMLElement | null>;
  fontSizePx: number;
  onClose: () => void;
  onDecreaseFontSize: () => void;
  onIncreaseFontSize: () => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
}

export default function EditorFormatMenu({
  editor,
  position,
  boundsRef,
  fontSizePx,
  onClose,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onToggleBold,
  onToggleItalic,
}: EditorFormatMenuProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const bounds = boundsRef?.current?.getBoundingClientRect();
  const offsetX = bounds?.left ?? 0;
  const offsetY = bounds?.top ?? 0;
  const boundsWidth = bounds?.width ?? window.innerWidth;
  const boundsHeight = bounds?.height ?? window.innerHeight;

  const menuWidth = 240;
  const menuHeight = 52;

  const left = Math.min(position.x - offsetX, boundsWidth - menuWidth - 16);
  const top = Math.min(position.y - offsetY, boundsHeight - menuHeight - 16);

  const isBold = editor.isActive("bold");
  const isItalic = editor.isActive("italic");
  const canDecrease = fontSizePx > MIN_FONT_SIZE_PX;
  const canIncrease = fontSizePx < MAX_FONT_SIZE_PX;

  const buttonClass =
    "flex-1 flex items-center justify-center py-2 text-sm text-[var(--slate-surface-text)] hover:bg-black/5 transition-colors disabled:opacity-30 disabled:pointer-events-none font-[family-name:var(--font-ui)]";

  return (
    <>
      <div className="absolute inset-0 z-40" onClick={onClose} aria-hidden="true" />

      <div
        className="absolute z-50 w-[240px] overflow-hidden rounded-2xl border border-[var(--slate-border)] bg-[var(--slate-surface)]/95 backdrop-blur-md shadow-[var(--slate-shadow)] popup-animate-in"
        style={{ left, top }}
        onClick={(e) => e.stopPropagation()}
        role="toolbar"
        aria-label="Text formatting"
      >
        <div className="flex items-stretch divide-x divide-[var(--slate-border)]">
          <button
            type="button"
            className={buttonClass}
            onClick={onDecreaseFontSize}
            disabled={!canDecrease}
            aria-label="Decrease font size"
          >
            <span className="text-xs leading-none">A</span>
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={onIncreaseFontSize}
            disabled={!canIncrease}
            aria-label="Increase font size"
          >
            <span className="text-lg leading-none">A</span>
          </button>
          <button
            type="button"
            className={`${buttonClass}${isBold ? " bg-black/5 font-bold" : " font-bold"}`}
            onClick={onToggleBold}
            aria-label="Bold"
            aria-pressed={isBold}
          >
            B
          </button>
          <button
            type="button"
            className={`${buttonClass}${isItalic ? " bg-black/5 italic" : " italic"}`}
            onClick={onToggleItalic}
            aria-label="Italic"
            aria-pressed={isItalic}
          >
            I
          </button>
        </div>
      </div>
    </>
  );
}
