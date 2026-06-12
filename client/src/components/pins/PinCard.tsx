import type { Pin } from "@/types";

interface PinCardProps {
  pin: Pin;
  onClick: () => void;
}

export default function PinCard({ pin, onClick }: PinCardProps) {
  return (
    <div
      onClick={onClick}
      className="w-[320px] h-[140px] bg-white/80 border border-[#E8E6E1] rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition overflow-hidden backdrop-blur-sm"
    >
      <h3 className="font-medium text-[#2D2D2D] mb-2 truncate font-[family-name:var(--font-ui)]">
        {pin.title}
      </h3>

      <p className="text-sm text-[#4A4A4A] leading-6 line-clamp-3 font-[family-name:var(--font-serif)]">
        {pin.summary}
      </p>
    </div>
  );
}
