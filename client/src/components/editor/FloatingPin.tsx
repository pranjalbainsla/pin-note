import { X } from "lucide-react";
import { Rnd } from "react-rnd";
import type { FloatingPin as FloatingPinType } from "@/hooks/usePins";
import { getPinTheme } from "@/constants/theme";

interface FloatingPinProps {
  pin: FloatingPinType;
  onClose: (id: string) => void;
  onPositionChange: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
}

export default function FloatingPin({
  pin,
  onClose,
  onPositionChange,
}: FloatingPinProps) {
  const theme = getPinTheme(pin.themeIndex);

  return (
    <Rnd
      default={{ x: pin.x, y: pin.y, width: pin.width, height: pin.height }}
      bounds="parent"
      minWidth={250}
      minHeight={150}
      dragHandleClassName="pin-drag-handle"
      onDragStop={(_e, data) => {
        onPositionChange(pin.id, data.x, data.y, pin.width, pin.height);
      }}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        onPositionChange(
          pin.id,
          position.x,
          position.y,
          ref.offsetWidth,
          ref.offsetHeight,
        );
      }}
      className="z-30"
    >
      <div
        className="group h-full rounded-2xl overflow-hidden flex flex-col backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border"
        style={{
          backgroundColor: theme.bg,
          borderColor: theme.border,
        }}
      >
        <div
          className="pin-drag-handle cursor-grab active:cursor-grabbing px-4 py-3 select-none flex items-center justify-between border-b"
          style={{
            backgroundColor: theme.header,
            borderColor: theme.border,
          }}
        >
          <h2
            className="font-medium text-sm text-[#2D2D2D] truncate font-[family-name:var(--font-ui)]"
          >
            {pin.title}
          </h2>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onClose(pin.id)}
            className="ml-2 p-1 rounded-lg text-[#6A6A6A] hover:text-[#2D2D2D] hover:bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Close pin"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-4 overflow-auto flex-1">
          <p
            className="text-sm text-[#4A4A4A] text-left leading-relaxed font-[family-name:var(--font-serif)]"
          >
            {pin.summary}
          </p>
        </div>
      </div>
    </Rnd>
  );
}
