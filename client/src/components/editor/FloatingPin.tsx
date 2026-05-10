import { Rnd } from "react-rnd";
import type { FloatingPin as FloatingPinType } from "../../hooks/usePins";

interface FloatingPinProps {
  pin: FloatingPinType;
}

export default function FloatingPin({ pin }: FloatingPinProps) {
  return (
    <Rnd
      default={{ x: pin.x, y: pin.y, width: pin.width, height: pin.height }}
      bounds="window"
      minWidth={250}
      minHeight={150}
      dragHandleClassName="pin-drag-handle"
    >
      <div className="h-full bg-yellow-50 border border-yellow-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="pin-drag-handle cursor-grab active:cursor-grabbing px-4 py-3 border-b border-yellow-200 bg-yellow-100 select-none">
          <h2 className="font-semibold text-sm">{pin.title}</h2>
        </div>
        <div className="p-4 overflow-auto flex-1">
          <p className="text-sm text-neutral-700 text-left leading-6">{pin.summary}</p>
        </div>
      </div>
    </Rnd>
  );
}