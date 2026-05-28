import { X } from "lucide-react";
import { Rnd } from "react-rnd";
import type { FloatingPin as FloatingPinType } from "../../hooks/usePins";

interface FloatingPinProps {
  pin: FloatingPinType;
  onClose: (id: string) => void;
}

export default function FloatingPin({ pin, onClose }: FloatingPinProps) {
  return (
    <Rnd
      default={{ x: pin.x, y: pin.y, width: pin.width, height: pin.height }}
      bounds="window"
      minWidth={250}
      minHeight={150}
      dragHandleClassName="pin-drag-handle"
    >
      <div className="h-full bg-yellow-50 border border-yellow-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="pin-drag-handle cursor-grab active:cursor-grabbing px-4 py-3 border-b border-yellow-200 bg-yellow-100 select-none flex items-center justify-between">
          <h2 className="font-semibold text-sm">{pin.title}</h2>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onClose(pin.id)}
            className="ml-2 p-0.5 rounded-md text-yellow-600 hover:text-yellow-900 hover:bg-yellow-200 transition-colors"
            aria-label="Close pin"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-4 overflow-auto flex-1">
          <p className="text-sm text-neutral-700 text-left leading-6">{pin.summary}</p>
        </div>
      </div>
    </Rnd>
  );
}