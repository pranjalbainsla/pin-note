import PinCard from "../PinCard";
import type { Pin } from "../../types";

interface PinsPopupProps {
  pins: Pin[];
  onClose: () => void;
  onSelect: (pin: Pin) => void;
}

export default function PinsPopup({ pins, onClose, onSelect }: PinsPopupProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-24 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-white rounded-3xl shadow-2xl p-8 overflow-y-auto"
      >
        <div className="grid grid-cols-3 gap-6">
          {pins.map((pin) => (
            <PinCard key={pin.id} pin={pin} onClick={() => onSelect(pin)} />
          ))}
        </div>
      </div>
    </div>
  );
}