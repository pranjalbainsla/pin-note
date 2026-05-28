import type { Pin } from "../../types";

interface PinCardProps {
  pin: Pin;
  onClick: () => void;
}

export default function PinCard({
  pin,
  onClick,
}: PinCardProps) {

  return (
    <div
      onClick={onClick}
      className="
        w-[320px]
        h-[140px]
        bg-white
        border
        border-neutral-200
        rounded-2xl
        p-4
        cursor-pointer
        shadow-sm
        hover:shadow-lg
        transition
        overflow-hidden
      "
    >

      <h3 className="font-semibold text-neutral-800 mb-2 truncate">
        {pin.title}
      </h3>

      <p className="text-sm text-neutral-500 leading-6 line-clamp-3">
        {pin.summary}
      </p>

    </div>
  );
}